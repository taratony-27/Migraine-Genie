import express from "express";
import { getWellnessContent } from "../controllers/wellnessContentController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// GET /api/wellness/content
router.get("/content", authenticateToken, getWellnessContent);

export default router;