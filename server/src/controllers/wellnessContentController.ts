import { Request, Response } from "express";
import WellnessContent from "../models/WellnessContent";
import { searchYouTubeVideos, ContentCard } from "../services/youtubeService";

export async function getWellnessContent(req: Request, res: Response): Promise<void> {
  const type = String(req.query.type || "all");
  const q = String(req.query.q || "").trim();
  const limit = Number(req.query.limit) || 20;

  try {
    let curatedItems: ContentCard[] = [];
    
    // Try to get DB items, but don't crash if DB is empty
    try {
      const dbQuery: any = { isActive: true };
      const curatedDocs = await WellnessContent.find(dbQuery).limit(5).lean();
      curatedItems = curatedDocs.map((doc: any) => ({
        type: doc.type,
        title: doc.title,
        desc: doc.desc,
        url: doc.url,
        imageUrl: doc.imageUrl,
        source: "Curated",
      }));
    } catch (e) {
      console.log("No DB items found, skipping...");
    }

    // Fetch from YouTube
    let youtubeItems: ContentCard[] = [];
    const ytSearchQuery = q ? `migraine ${q}` : "migraine relief exercises";
    youtubeItems = await searchYouTubeVideos({ q: ytSearchQuery, maxResults: 12 });

    let combined = [...curatedItems, ...youtubeItems].slice(0, limit);

    // EMERGENCY FALLBACK: If combined is still empty, add 2 hardcoded videos
    if (combined.length === 0) {
      console.log("⚠️ Everything empty, showing fallback videos.");
      combined = [
        {
          type: "video",
          title: "Yoga for Migraines",
          desc: "A gentle 15-minute routine for headache relief.",
          url: "https://www.youtube.com/watch?v=NxX9ifp9S6M",
          imageUrl: "https://img.youtube.com/vi/NxX9ifp9S6M/0.jpg",
          source: "Fallback"
        },
        {
          type: "video",
          title: "Breathing Exercises for Pain",
          desc: "How to use breath to calm a migraine attack.",
          url: "https://www.youtube.com/watch?v=0fL-pn802-w",
          imageUrl: "https://img.youtube.com/vi/0fL-pn802-w/0.jpg",
          source: "Fallback"
        }
      ];
    }

    res.status(200).json({ items: combined });
  } catch (err: any) {
    console.error("Wellness Controller Error:", err);
    res.status(500).json({ items: [], message: "Internal server error" });
  }
}