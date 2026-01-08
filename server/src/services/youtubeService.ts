// src/services/youtubeService.ts
import axios from "axios";

/**
 * Normalized content card returned to the app
 */
export type ContentCard = {
  type: "video";
  title: string;
  desc: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

/**
 * Minimal YouTube Search API response typing
 * (only what we actually use)
 */
type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
};

export async function searchYouTubeVideos(params: {
  q: string;
  maxResults?: number;
}): Promise<ContentCard[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY");
  }

  const maxResults = Math.min(Math.max(params.maxResults ?? 9, 1), 15);

  // 🔑 Explicitly type Axios response
  const resp = await axios.get<YouTubeSearchResponse>(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        type: "video",
        q: params.q,
        maxResults,
        safeSearch: "strict",
        key: apiKey,
      },
      timeout: 20_000,
    }
  );

  // ✅ TS now knows items exists
  const items: YouTubeSearchItem[] = resp.data.items ?? [];

  return items
    .map((it): ContentCard | null => {
      const videoId = it.id?.videoId;
      const sn = it.snippet;

      if (!videoId || !sn) return null;

      return {
        type: "video",
        title: String(sn.title ?? "").trim(),
        desc: String(sn.description ?? "").trim(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        imageUrl:
          sn.thumbnails?.high?.url ||
          sn.thumbnails?.medium?.url ||
          sn.thumbnails?.default?.url,
        source: "YouTube",
        publishedAt: sn.publishedAt,
      };
    })
    .filter((v): v is ContentCard => v !== null);
}
