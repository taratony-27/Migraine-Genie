import { Request, Response } from "express";
import User from "../models/User";
import DailyInput from "../models/DailyInput";
import Medication from "../models/Medication";
import Symptom from "../models/Symptom";
import Trigger from "../models/Trigger";
import { getAuth } from "firebase-admin/auth";
import firebaseApp from "../services/firebaseAdmin";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ── GET /api/users ─────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password_hash -email_verify_token_hash");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── POST /api/users/sync ───────────────────────────────────────────────────
// Called by the client right after Firebase sign-in.
// Finds or creates the MongoDB user record keyed by Firebase UID.
// Returns the user profile so the client can store it in localStorage.
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, email, name: firebaseName } = req.user!;
    const body = req.body as { name?: string; date_of_birth?: string; gender?: string };

    const name = body.name || firebaseName || email?.split("@")[0] || "User";

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email from token" });
      return;
    }

    // Upsert: find by firebase_uid, create if not found
    let user = await User.findOne({ firebase_uid: uid });

    if (!user) {
      // Also check by email in case a legacy local account exists
      user = await User.findOne({ email });
      if (user) {
        // Attach Firebase UID to the existing account
        user.firebase_uid = uid;
        user.auth_provider = "firebase";
        user.email_verified = true;
        await user.save();
      } else {
        user = await User.create({
          firebase_uid: uid,
          user_id: Date.now(),
          name,
          email,
          auth_provider: "firebase",
          email_verified: true,
        });
      }
    }

    const safeUser = await User.findById(user._id).select(
      "-password_hash -email_verify_token_hash -email_verify_token_expires_at"
    );

    res.json({ user: safeUser });
  } catch (err: any) {
    console.error("syncUser error:", err);
    res.status(500).json({ message: "Sync error", error: err.message });
  }
};

// ── GET /api/users/me ─────────────────────────────────────────────────────
// Profile plus the derived stats the Account page shows (joined date,
// total diary entries, most recent intensity).
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ firebase_uid: uid })
      .select("-password_hash -email_verify_token_hash -email_verify_token_expires_at")
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userId = user.user_id;
    const [totalEntries, latest] = await Promise.all([
      typeof userId === "number" ? DailyInput.countDocuments({ user_id: userId }) : 0,
      typeof userId === "number"
        ? DailyInput.findOne({ user_id: userId }).sort({ log_date: -1 }).select("intensity").lean()
        : null,
    ]);

    res.json({
      user,
      stats: {
        joined: user.created_at ? new Date(user.created_at).toISOString() : null,
        totalEntries,
        recentIntensity: latest?.intensity || "N/A",
      },
    });
  } catch (err: any) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Failed to load account", error: err.message });
  }
};

// ── PUT /api/users/update ─────────────────────────────────────────────────
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const body = req.body as { name?: string; dateOfBirth?: string; gender?: string };
    const { name, dateOfBirth, gender } = body;

    const validGenders = ["male", "female", "other"];
    if (gender && !validGenders.includes(gender)) {
      res.status(400).json({ message: "Invalid gender" });
      return;
    }

    const updated = await User.findOneAndUpdate(
      { firebase_uid: uid },
      {
        ...(name        && { name }),
        ...(dateOfBirth && { date_of_birth: new Date(dateOfBirth) }),
        ...(gender      && { gender }),
      },
      { new: true }
    ).select("-password_hash -email_verify_token_hash");

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: "Update error", error: err.message });
  }
};

// ── DELETE /api/users/me ──────────────────────────────────────────────────
// Deletes the MongoDB profile, user-owned health records, and Firebase Auth user.
export const deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ firebase_uid: uid });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userId = user.user_id;
    await Promise.all([
      userId ? DailyInput.deleteMany({ user_id: userId }) : Promise.resolve(),
      userId ? Medication.deleteMany({ user_id: userId }) : Promise.resolve(),
      userId ? Symptom.deleteMany({ user_id: userId }) : Promise.resolve(),
      userId ? Trigger.deleteMany({ user_id: userId }) : Promise.resolve(),
      User.deleteOne({ _id: user._id }),
    ]);

    await getAuth(firebaseApp).deleteUser(uid);

    res.json({ message: "Account data deleted successfully" });
  } catch (err: any) {
    console.error("deleteCurrentUser error:", err);
    res.status(500).json({ message: "Delete account failed", error: err.message });
  }
};
