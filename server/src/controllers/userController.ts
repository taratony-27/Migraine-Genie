import { Request, Response } from "express";
import User from "../models/User";

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
