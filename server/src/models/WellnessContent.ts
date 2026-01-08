// src/models/WellnessContent.ts
import mongoose from "mongoose";

export type WellnessContentType = "article" | "video";

const WellnessContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["article", "video"], required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String },
    source: { type: String }, // e.g. "MedlinePlus", "YouTube", "Internal"
    tags: [{ type: String }],  // e.g. ["migraine", "sleep", "screen"]
    publishedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("WellnessContent", WellnessContentSchema);
