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

export async function searchYouTubeVideos(params: {
  q: string;
  maxResults?: number;
}): Promise<ContentCard[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  // LOG 1: Check if API key exists
  if (!apiKey) {
    console.error("❌ YOUTUBE_API_KEY IS MISSING IN .ENV");
    return [];
  }

  console.log(`🔍 Searching YouTube for: "${params.q}"`);

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        type: "video",
        q: params.q,
        maxResults: params.maxResults || 10,
        safeSearch: "strict",
        key: apiKey,
      },
    });

    const items = response.data.items || [];
    console.log(`✅ YouTube returned ${items.length} videos`);

    return items.map((it: any) => ({
      type: "video",
      title: it.snippet?.title || "No Title",
      desc: it.snippet?.description || "",
      url: `https://www.youtube.com/watch?v=${it.id?.videoId}`,
      imageUrl: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url,
      source: "YouTube",
      publishedAt: it.snippet?.publishedAt,
    })).filter((v: any) => v.url && !v.url.includes("undefined"));
  } catch (error: any) {
    // LOG 2: See exactly what Google says is wrong
    console.error("❌ YouTube API Error Response:", error.response?.data || error.message);
    return [];
  }
}