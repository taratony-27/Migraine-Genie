// In-memory per-key rate limiter for the paid endpoints (OpenRouter, YouTube).
// The API runs as a single Render instance, so process memory is enough; a
// restart simply resets the counters.

const hits = new Map<string, number[]>();

/**
 * Records one use of `key` and returns true if it is within `limit` uses per
 * `windowMs`; returns false (and records nothing) once the limit is reached.
 */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export const HOUR_MS = 60 * 60 * 1000;
