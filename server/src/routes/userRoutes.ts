import express from "express";
import {
  getUsers,
  loginUser,
  signupUser,
  updateUser,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/userController";
import { googleAuth } from "../controllers/authGoogleController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", getUsers);
router.post("/login", loginUser);
router.post("/signup", signupUser);

router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// ✅ Google login/signup
router.post("/auth/google", googleAuth);

router.put("/update", authenticateToken, updateUser);

export default router;