import express from "express";
import { deleteCurrentUser, getMe, syncUser, updateUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Protected — require a valid Firebase ID token
router.post("/sync",   authenticateToken, syncUser);
router.get("/me",      authenticateToken, getMe);
router.put("/update",  authenticateToken, updateUser);
router.delete("/me",   authenticateToken, deleteCurrentUser);

export default router;
