import axios from "axios";

export type ContentCard = {
  type: "video";
  title: string;
  desc: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

type YouTubeSearchResponse = {
  items?: {
    id?: { kind?: string; videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
  }[];
  error?: any;
};

function getYouTubeApiKey(): string | null {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || !key.trim()) return null;
  return key.trim();
}

export async function searchYouTubeVideos(params: {
  q: string;
  maxResults?: number;
}): Promise<ContentCard[]> {
  const apiKey = getYouTubeApiKey();

  if (!apiKey) {
    console.error("❌ YOUTUBE_API_KEY is missing on server env");
    return [];
  }

  const query = params.q?.trim();
  if (!query) return [];

  try {
    const response = await axios.get<YouTubeSearchResponse>(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          type: "video",
          q: query,
          maxResults: params.maxResults ?? 10,

          // Improve result reliability
          videoEmbeddable: "true",
          order: "relevance", // match normal YouTube search ranking, not just newest
          videoDuration: "medium", // 4–20 min — excludes Shorts, favors long-form
          regionCode: "US",
          relevanceLanguage: "en",
          safeSearch: "moderate", // strict often reduces results too aggressively

          key: apiKey,
        },
        timeout: 15000,
      }
    );

    const items = response.data?.items ?? [];

    const cards = items
      .filter((it) => typeof it?.id?.videoId === "string" && it.id!.videoId!.length > 0)
      .map((it) => {
        const vid = it.id!.videoId as string;
        return {
          type: "video" as const,
          title: it.snippet?.title ?? "No Title",
          desc: it.snippet?.description ?? "",
          url: `https://www.youtube.com/watch?v=${vid}`,
          imageUrl:
            it.snippet?.thumbnails?.high?.url ??
            it.snippet?.thumbnails?.medium?.url ??
            it.snippet?.thumbnails?.default?.url,
          source: "YouTube",
          publishedAt: it.snippet?.publishedAt,
        };
      });

    return cards;
  } catch (error: any) {
    // This is the key part: log YouTube’s exact error payload
    const status = error.response?.status;
    const data = error.response?.data;

    console.error("❌ YouTube API Error:", {
      status,
      message: error.message,
      data,
    });

    return [];
  }
}