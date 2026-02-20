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
    id?: {
      kind?: string;
      videoId?: string;
    };
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
};

export async function searchYouTubeVideos(params: {
  q: string;
  maxResults?: number;
}): Promise<ContentCard[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is missing");
    return [];
  }

  try {
    const response = await axios.get<YouTubeSearchResponse>(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          type: "video",
          q: params.q,
          maxResults: params.maxResults ?? 10,
          safeSearch: "strict",
          key: apiKey,
        },
      }
    );

    const items = response.data?.items ?? [];

    return items
      .filter(
        (it) =>
          typeof it?.id?.videoId === "string" &&
          it.id.videoId.length > 0
      )
      .map((it) => ({
        type: "video" as const,
        title: it.snippet?.title ?? "No Title",
        desc: it.snippet?.description ?? "",
        url: `https://www.youtube.com/watch?v=${it.id!.videoId}`,
        imageUrl:
          it.snippet?.thumbnails?.high?.url ??
          it.snippet?.thumbnails?.medium?.url ??
          it.snippet?.thumbnails?.default?.url,
        source: "YouTube",
        publishedAt: it.snippet?.publishedAt,
      }));
  } catch (error: any) {
    console.error("YouTube API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
}