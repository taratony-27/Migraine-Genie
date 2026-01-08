// src/controllers/wellnessContentController.ts
import { Request, Response } from "express";
import WellnessContent from "../models/WellnessContent";
import { TTLCache } from "../utils/ttlCache";
import { searchYouTubeVideos, ContentCard } from "../services/youtubeService";

/**
 * Enterprise-grade notes:
 * - No "return res.json(...)" early returns that confuse TS/React tooling.
 * - Explicit Promise<void> and explicit `return;` after responding.
 * - Safe query validation + normalization.
 * - Cache TTL + cache key includes versioning.
 * - Defensive response shape.
 * - Graceful YouTube failure (does not break endpoint).
 * - Minimal data leakage in error messages.
 */

const cache = new TTLCache();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_VERSION = "v1";

type WellnessType = "all" | "article" | "video";

const STATIC_FALLBACK: ContentCard[] = [
  {
    type: "video",
    title: "Migraine breathing exercise (quick calm)",
    desc: "Short breathing routine to reduce stress and tension (general wellness).",
    url: "https://www.youtube.com/results?search_query=migraine+breathing+exercise",
    source: "Internal",
  },
];

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function normalizeType(val: unknown): WellnessType {
  const t = String(val ?? "all").toLowerCase().trim();
  if (t === "article" || t === "video" || t === "all") return t;
  return "all";
}

function normalizeQuery(val: unknown, maxLen = 80): string {
  const q = String(val ?? "").trim();
  if (!q) return "";
  // Avoid insane regex load / log noise
  return q.slice(0, maxLen);
}

function safeRegexOrNull(q: string): RegExp | null {
  if (!q) return null;
  // Escape regex special chars (treat q as plain text, not regex pattern)
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
}

// Normalize DB doc -> ContentCard
function mapDbToCard(doc: any): ContentCard {
  return {
    type: doc.type,
    title: String(doc.title ?? "").trim(),
    desc: String(doc.desc ?? "").trim(),
    url: String(doc.url ?? "").trim(),
    imageUrl: doc.imageUrl ? String(doc.imageUrl).trim() : undefined,
    source: doc.source ? String(doc.source).trim() : "Internal",
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : undefined,
  };
}

export async function getWellnessContent(req: Request, res: Response): Promise<void> {
  const type = normalizeType(req.query.type);
  const q = normalizeQuery(req.query.q);
  const limit = clampInt(req.query.limit, 1, 50, 20);

  const cacheKey = `${CACHE_VERSION}:wellness:${type}:${q}:${limit}`;

  try {
    // 1) Serve cached
    const cached = cache.get<{ items: ContentCard[] }>(cacheKey);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    // 2) Build DB query
    const dbQuery: any = { isActive: true };
    if (type === "article" || type === "video") dbQuery.type = type;

    const re = safeRegexOrNull(q);
    if (re) {
      dbQuery.$or = [
        { title: re },
        { desc: re },
        // tags likely stored lowercase; this keeps it simple and safe
        { tags: re },
      ];
    }

    // 3) Fetch curated items
    const curatedDocs = await WellnessContent.find(dbQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const curatedItems: ContentCard[] = curatedDocs
      .map(mapDbToCard)
      // Hard validation: must have title + url
      .filter((x) => x.title.length > 0 && x.url.length > 0);

    // 4) Optional YouTube enrichment
    // Enterprise rule: only query YouTube when:
    // - user explicitly searches (q present) AND
    // - type allows videos AND
    // - API key exists
    let youtubeItems: ContentCard[] = [];
    const shouldFetchYouTube =
      (type === "all" || type === "video") && Boolean(process.env.YOUTUBE_API_KEY) && Boolean(q);

    if (shouldFetchYouTube) {
      try {
        youtubeItems = await searchYouTubeVideos({
          q: `migraine ${q}`.trim(), // bias toward migraine context
          maxResults: Math.min(9, limit),
        });
      } catch (ytErr: any) {
        // Do NOT fail the endpoint for an external dependency outage
        console.warn("YouTube enrichment failed:", ytErr?.message || ytErr);
        youtubeItems = [];
      }
    }

    // 5) Merge (curated first)
    const merged: ContentCard[] = [...curatedItems, ...youtubeItems].slice(0, limit);

    const payload = {
      items: merged.length ? merged : STATIC_FALLBACK,
      meta: {
        type,
        q,
        limit,
        cached: false,
        sources: {
          curated: curatedItems.length,
          youtube: youtubeItems.length,
        },
      },
    };

    cache.set(cacheKey, payload, CACHE_TTL_MS);
    res.status(200).json(payload);
    return;
  } catch (err: any) {
    // Log full error internally
    console.error("getWellnessContent error:", err);

    // Send safe error to client
    res.status(500).json({
      message: "Failed to load wellness content.",
      meta: { type, q, limit },
    });
    return;
  }
}
