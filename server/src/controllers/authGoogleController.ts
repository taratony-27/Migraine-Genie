import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(googleClientId);

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body as { credential?: string };
    if (!credential) {
      res.status(400).json({ message: "Missing credential" });
      return;
    }
    if (!googleClientId) {
      res.status(500).json({ message: "GOOGLE_CLIENT_ID missing on server" });
      return;
    }

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ message: "Invalid Google token" });
      return;
    }

    const email = payload.email;
    const emailVerifiedByGoogle = payload.email_verified;
    const sub = payload.sub; // stable google user id
    const name = payload.name || payload.given_name || "User";

    if (!email || !sub) {
      res.status(401).json({ message: "Google token missing email/sub" });
      return;
    }

    // Find existing user by email first (account linking)
    let user = await User.findOne({ email });

    if (user) {
      // link Google if not linked yet
      if (!user.google_sub) user.google_sub = sub;
      user.auth_provider = "google";
      user.email_verified = true; // Google email is verified (usually)
      await user.save();
    } else {
      // create new user
      user = await User.create({
        user_id: Date.now(),
        name,
        email,
        password_hash: null,
        date_of_birth: null,
        gender: null,
        email_verified: Boolean(emailVerifiedByGoogle ?? true),
        auth_provider: "google",
        google_sub: sub,
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1d" });

    const safeUser = await User.findById(user._id).select("-password_hash -email_verify_token_hash");

    res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google auth error", error: err.message || String(err) });
  }
};