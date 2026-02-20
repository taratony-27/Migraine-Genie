import express from "express";
import { getWellnessContent } from "../controllers/wellnessContentController";

const router = express.Router();

// GET /api/wellness/content
router.get("/content", getWellnessContent);

export default router;