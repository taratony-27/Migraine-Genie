import express from "express";
import {
  getUsers,
  loginUser,
  signupUser,
  updateUser,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", getUsers);
router.post("/login", loginUser);
router.post("/signup", signupUser);

// ✅ Email verification
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// ✅ protected profile update
router.put("/update", authenticateToken, updateUser);

export default router;