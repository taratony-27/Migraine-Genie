// src/routes/wellnessContentRoutes.ts
import express from "express";
import { getWellnessContent } from "../controllers/wellnessContentController";

const router = express.Router();

// GET /api/wellness/content?type=all|article|video&q=migraine&limit=20
router.get("/content", getWellnessContent);

export default router;
