import express from "express";
import { deleteCurrentUser, getMe, getUsers, syncUser, updateUser } from "../controllers/userController";
import { googleAuth } from "../controllers/authGoogleController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public
router.get("/", getUsers);
router.post("/auth/google", googleAuth);

// Protected — require a valid Firebase ID token
router.post("/sync",   authenticateToken, syncUser);
router.get("/me",      authenticateToken, getMe);
router.put("/update",  authenticateToken, updateUser);
router.delete("/me",   authenticateToken, deleteCurrentUser);

export default router;
