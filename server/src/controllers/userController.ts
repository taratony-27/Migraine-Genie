import  { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import { sendVerificationEmail } from "../services/mailer";

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password_hash -email_verify_token_hash");
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ block login if email not verified
    if (!user.email_verified) {
      res.status(403).json({
        message: "Email not verified. Please verify your email before logging in.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1d" });

    // avoid leaking hash
    const safeUser = await User.findById(user._id).select("-password_hash -email_verify_token_hash");
    res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message || String(err) });
  }
};

// User Signup (creates user + sends verify email)
export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📩 Signup request received:", req.body);

    const { name, email, password, date_of_birth, gender } = req.body;

    if (!name || !email || !password || !date_of_birth || !gender) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender)) {
      res.status(400).json({ message: "Invalid gender value" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    // ✅ Create verification token (store hash, email raw token)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const newUser = new User({
      user_id: Date.now(),
      name,
      email,
      password_hash,
      date_of_birth: new Date(date_of_birth),
      gender,
      email_verified: false,
      email_verify_token_hash: tokenHash,
      email_verify_token_expires_at: expires,
    });

    const savedUser = await newUser.save();
    console.log("✅ New user created:", savedUser._id);

    // ✅ Send verification email
    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${appBaseUrl}/verify-email?token=${rawToken}`;

    try {
      await sendVerificationEmail({ to: email, name, verifyUrl });
    } catch (mailErr: any) {
      console.error("❌ Email send failed:", mailErr);
      // You can decide whether to rollback the user creation; usually don't.
    }

    res.status(201).json({
      message: "Signup successful. Please check your email to verify your account.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        email_verified: savedUser.email_verified,
      },
    });
  } catch (err: any) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Signup error", error: err.message || String(err) });
  }
};

// ✅ Verify email endpoint
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.query.token || "");
    if (!token) {
      res.status(400).json({ message: "Missing token" });
      return;
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email_verify_token_hash: tokenHash,
      email_verify_token_expires_at: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired verification token" });
      return;
    }

    user.email_verified = true;
    user.email_verify_token_hash = null;
    user.email_verify_token_expires_at = null;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err: any) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Verify email error", error: err.message || String(err) });
  }
};

// ✅ Resend verification email endpoint
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // do not reveal user existence
      res.json({ message: "If that email exists, a verification email has been sent." });
      return;
    }

    if (user.email_verified) {
      res.json({ message: "Email already verified. You can log in." });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.email_verify_token_hash = tokenHash;
    user.email_verify_token_expires_at = expires;
    await user.save();

    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${appBaseUrl}/verify-email?token=${rawToken}`;

    await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (err: any) {
    console.error("Resend verify email error:", err);
    res.status(500).json({ message: "Resend verify email error", error: err.message || String(err) });
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // assuming JWT middleware adds user
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, dateOfBirth, gender } = req.body;

    const validGenders = ["male", "female", "other"];
    if (gender && !validGenders.includes(gender)) {
      res.status(400).json({ message: "Invalid gender" });
      return;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(dateOfBirth && { date_of_birth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
      },
      { new: true }
    ).select("-password_hash -email_verify_token_hash");

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update error", error: err.message });
  }
};