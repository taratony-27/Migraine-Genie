import { Request, Response } from "express";
import WellnessContent from "../models/WellnessContent";
import { searchYouTubeVideos, ContentCard } from "../services/youtubeService";

export async function getWellnessContent(req: Request, res: Response): Promise<void> {
  const type = String(req.query.type || "all");
  const q = String(req.query.q || "").trim();
  const limit = Number(req.query.limit) || 20;

  try {
    let curatedItems: ContentCard[] = [];

    // DB (curated)
    try {
      const curatedDocs = await WellnessContent.find({ isActive: true }).limit(5).lean();
      curatedItems = curatedDocs
        .filter((doc: any) => doc?.type === "video") // ensure ContentCard compatibility
        .map((doc: any) => ({
          type: "video",
          title: doc.title,
          desc: doc.desc,
          url: doc.url,
          imageUrl: doc.imageUrl,
          source: doc.source || "Curated",
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : undefined,
        }));
    } catch (e) {
      console.log("ℹ️ Curated DB read failed or empty, continuing...", e);
    }

    // YouTube
    const ytSearchQuery = q ? `migraine ${q}` : "migraine relief exercises";
    const youtubeItems = await searchYouTubeVideos({ q: ytSearchQuery, maxResults: 12 });

    console.log("✅ WellnessContent:", {
      q,
      type,
      ytSearchQuery,
      curatedCount: curatedItems.length,
      youtubeCount: youtubeItems.length,
    });

    // Combine + optional type filtering
    let combined: ContentCard[] = [...curatedItems, ...youtubeItems];

    if (type !== "all") {
      combined = combined.filter((x) => x.type === type);
    }

    combined = combined.slice(0, limit);

    // Fallback
    if (combined.length === 0) {
      console.log("⚠️ Everything empty, showing fallback videos.");
      combined = [
        {
          type: "video",
          title: "Yoga for Migraines",
          desc: "A gentle 15-minute routine for headache relief.",
          url: "https://www.youtube.com/watch?v=NxX9ifp9S6M",
          imageUrl: "https://img.youtube.com/vi/NxX9ifp9S6M/0.jpg",
          source: "Fallback",
          publishedAt: undefined,
        },
        {
          type: "video",
          title: "Breathing Exercises for Pain",
          desc: "How to use breath to calm a migraine attack.",
          url: "https://www.youtube.com/watch?v=0fL-pn802-w",
          imageUrl: "https://img.youtube.com/vi/0fL-pn802-w/0.jpg",
          source: "Fallback",
          publishedAt: undefined,
        },
      ];
    }

    res.status(200).json({
      items: combined,
      meta: {
        q,
        type,
        limit,
        ytSearchQuery,
        curatedCount: curatedItems.length,
        youtubeCount: youtubeItems.length,
        // This helps you debug prod quickly without opening server logs:
        hasYouTubeKey: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim()),
      },
    });
  } catch (err: any) {
    console.error("Wellness Controller Error:", err);
    res.status(500).json({ items: [], message: "Internal server error" });
  }
}