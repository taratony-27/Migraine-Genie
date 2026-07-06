import express from "express";
import { getUsers, syncUser, updateUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public
router.get("/", getUsers);

// Protected — require a valid Firebase ID token
router.post("/sync",   authenticateToken, syncUser);
router.put("/update",  authenticateToken, updateUser);

export default router;
