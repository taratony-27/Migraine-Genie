// server/src/routes/predictionRoutes.ts
import express, { Request, Response } from "express";
import axios from "axios";
import DailyInput from "../models/DailyInput";
import Prediction from "../models/Prediction";
import { authenticateToken } from "../middleware/auth";
import { getAuthenticatedUserId } from "../utils/authUser";
import { triggerLabels, vmPathiScoreOf } from "../utils/logFeatures";
import { allowRequest, HOUR_MS } from "../utils/rateLimit";

const router = express.Router();

router.use(authenticateToken);

type OpenRouterChatResponse = {
  choices: { message: { content: string } }[];
};

type TriggerRisk = {
  icon: string;
  label: string;
  risk: "High Risk" | "Medium Risk" | "Low Risk";
};

type ForecastDay = {
  day: string;
  risk: number; // 0–100
};

export type MigrainePredictionData = {
  triggers: TriggerRisk[];
  forecast: ForecastDay[];
  recommendations: string[];
  encouragement: string;
  confidence: "Low" | "Medium" | "High";
};

// ───────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const parsed = parseFloat(String(val));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildFeaturesFromLogs(recentLogs: any[]) {
  let sleepSum = 0;
  let sleepCount = 0;
  let screenSum = 0;
  let screenCount = 0;
  const triggerCounts: Record<string, number> = {};
  let vmPathiSum = 0;
  let vmPathiCount = 0;

  for (const rawEntry of recentLogs) {
    const entry = rawEntry as any;

    const sleepVal = toNumber(entry.sleep);
    if (sleepVal !== null) {
      sleepSum += sleepVal;
      sleepCount++;
    }

    const screenVal = toNumber(entry.screentime);
    if (screenVal !== null) {
      screenSum += screenVal;
      screenCount++;
    }

    const vmPathiVal = vmPathiScoreOf(entry);
    if (vmPathiVal !== null) {
      vmPathiSum += vmPathiVal;
      vmPathiCount++;
    }

    for (const key of triggerLabels(entry.trigger)) {
      triggerCounts[key] = (triggerCounts[key] || 0) + 1;
    }
  }

  const commonTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  return {
    totalLogs: recentLogs.length,
    avgSleepHours: sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(1)) : null,
    avgScreenTimeHours: screenCount > 0 ? Number((screenSum / screenCount).toFixed(1)) : null,
    // VM-PATHI: 0-100 symptom severity index (sum of 25 items scored 0-4)
    avgVmPathiScore: vmPathiCount > 0 ? Number((vmPathiSum / vmPathiCount).toFixed(1)) : null,
    commonTriggers,
  };
}

function softenLanguage(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bmust\b/gi, "can"],
    [/\bcritical\b/gi, "important"],
    [/\bdangerous\b/gi, "potentially concerning"],
    [/\bsevere\b/gi, "strong"],
    [/\bhigh risk\b/gi, "higher likelihood"],
    [/\byou will\b/gi, "you may"],
    [/\bguarantee\b/gi, "often helps"],
    [/\bnever\b/gi, "rarely"],
    [/\balways\b/gi, "often"],
  ];

  let out = text;
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  return out.trim();
}

function normalizeRiskLabel(input: unknown): "High Risk" | "Medium Risk" | "Low Risk" {
  const s = String(input ?? "").toLowerCase();
  if (s.includes("high")) return "High Risk";
  if (s.includes("low")) return "Low Risk";
  return "Medium Risk";
}

function normalizeConfidence(input: unknown): "Low" | "Medium" | "High" {
  const s = String(input ?? "").toLowerCase();
  if (s.includes("high")) return "High";
  if (s.includes("low")) return "Low";
  return "Medium";
}

/**
 * Validation + normalization
 */
function validatePredictionData(raw: unknown): MigrainePredictionData {
  if (!raw || typeof raw !== "object") throw new Error("Prediction data is not an object.");

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.triggers)) throw new Error("Prediction data missing triggers array.");
  if (!Array.isArray(obj.forecast)) throw new Error("Prediction data missing forecast array.");
  if (!Array.isArray(obj.recommendations)) throw new Error("Prediction data missing recommendations array.");

  const triggers: TriggerRisk[] = (obj.triggers as unknown[])
    .slice(0, 6)
    .map((t: unknown): TriggerRisk => {
      const tt = (t ?? {}) as Record<string, unknown>;
      const label = typeof tt.label === "string" && tt.label.trim() ? tt.label.trim() : "Unknown trigger";
      return {
        icon: typeof tt.icon === "string" ? tt.icon : "",
        label,
        risk: normalizeRiskLabel(tt.risk),
      };
    });

  const forecast: ForecastDay[] = (obj.forecast as unknown[])
    .slice(0, 7)
    .map((d: unknown, idx: number): ForecastDay => {
      const dd = (d ?? {}) as Record<string, unknown>;
      const riskRaw = dd.risk;
      const riskNum =
        typeof riskRaw === "number" ? riskRaw : parseInt(String(riskRaw ?? ""), 10);

      return {
        day: typeof dd.day === "string" && dd.day.trim() ? dd.day.trim() : `Day ${idx + 1}`,
        risk: Number.isFinite(riskNum) ? Math.min(Math.max(riskNum, 0), 100) : 0,
      };
    });

  while (forecast.length < 7) {
    forecast.push({
      day: `Day ${forecast.length + 1}`,
      risk: forecast[forecast.length - 1]?.risk ?? 35,
    });
  }

  const recommendations: string[] = (obj.recommendations as unknown[])
    .filter((r: unknown): r is string => typeof r === "string")
    .map((r: string) => softenLanguage(r))
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0)
    .slice(0, 6);

  while (recommendations.length < 3) {
    recommendations.push(
      "Try one small, consistent adjustment this week (sleep timing, screen breaks) and note what helps most."
    );
  }

  const encouragement =
    typeof obj.encouragement === "string" && obj.encouragement.trim()
      ? softenLanguage(obj.encouragement).trim()
      : "You’re building useful patterns—small changes over a week can add up to meaningful relief.";

  const confidence = normalizeConfidence(obj.confidence);

  return { triggers, forecast, recommendations, encouragement, confidence };
}

// ───────────────────────────────────────────
// LLM CALL WITH FALLBACK
// ───────────────────────────────────────────

const MODEL_SEQUENCE: string[] = [
  "openai/gpt-4o-mini",
  "google/gemma-3-27b-it",
  "google/gemma-3-12b-it",
  "google/gemma-3-4b-it",
  "google/gemini-2.0-flash-exp",
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-3.2-3b-instruct",
  "nousresearch/hermes-3-llama-3.1-405b",
  "mistralai/mistral-7b-instruct",
];

const SYSTEM_PROMPT = `
You are "Migraine Genie", a supportive migraine-pattern assistant.

STYLE (IMPORTANT):
- Be calm, optimistic, and practical.
- Avoid fear, alarm, shame, or absolute language ("must", "guarantee", "you will").
- Do not diagnose. Do not claim certainty. Use "may", "often", "might".
- Focus on small wins and actionable steps.
- If there is risk, describe it gently and offer next steps without panic.

INPUT:
- Stats: aggregated values + commonTriggers.
- Logs: recent daily entries.

TASKS:
1) Triggers (lenient + realistic)
- Choose up to 4–6 triggers that are most supported by the logs.
- Risk labels must be: "High Risk" | "Medium Risk" | "Low Risk"
- Use "High Risk" only when pattern is strong (frequent trigger + symptom spikes).

2) Forecast (exactly 7 days)
- Return 7 items, risk as INTEGER 0..100.
- Avoid rigid patterns. Keep variation realistic.
- Keep forecast slightly conservative (do NOT overestimate).
- If logs are improving, keep upcoming risk lower.

3) Recommendations (3–6 items)
- Must be specific and tied to the user's actual patterns.
- Keep tone positive and achievable (e.g. “Try…”, “Consider…”).
- Prefer “doable next steps” over big lifestyle changes.

4) Add:
- "encouragement": one short positive line
- "confidence": "Low" | "Medium" | "High" based on how consistent patterns are.

RETURN ONLY JSON (no markdown):

{
  "triggers": [
    { "icon": "string", "label": "string", "risk": "High Risk | Medium Risk | Low Risk" }
  ],
  "forecast": [
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 },
    { "day": "string", "risk": 0 }
  ],
  "recommendations": ["string", "string", "string"],
  "encouragement": "string",
  "confidence": "Low | Medium | High"
}
`.trim();

function safeJsonParse(input: string): unknown {
  const clean = input.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

async function callMigraineModelWithFallback(
  stats: any,
  logs: any[]
): Promise<{ data: MigrainePredictionData; modelUsed: string }> {
  let lastError: unknown = null;

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  for (const model of MODEL_SEQUENCE) {
    try {
      console.log(`🔮 Trying model: ${model}`);

      const response = await axios.post<OpenRouterChatResponse>(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Stats: ${JSON.stringify(stats)}\n\nLogs: ${JSON.stringify(logs)}` },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 900,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost",
            "X-Title": process.env.OPENROUTER_APP_NAME || "Migraine Genie",
          },
          timeout: 60000,
        }
      );

      const aiContent: string = response.data?.choices?.[0]?.message?.content || "{}";

      let parsed: unknown;
      try {
        parsed = safeJsonParse(aiContent);
      } catch (parseErr) {
        console.error(`❌ JSON parse failed for model ${model}:`, parseErr);
        lastError = parseErr;
        continue;
      }

      let validated: MigrainePredictionData;
      try {
        validated = validatePredictionData(parsed);
      } catch (validationErr) {
        console.error(`❌ Validation failed for model ${model}:`, (validationErr as Error).message);
        lastError = validationErr;
        continue;
      }

      console.log(`✅ Model ${model} succeeded.`);
      return { data: validated, modelUsed: model };
    } catch (err: any) {
      console.error(`❌ Request failed for model ${model}:`, err?.response?.data || err.message || err);
      lastError = err;
    }
  }

  throw new Error(
    `All models failed. Last error: ${(lastError as any)?.message || JSON.stringify(lastError)}`
  );
}

// ───────────────────────────────────────────
// ROUTE
// ───────────────────────────────────────────

router.get("/generate", async (req: Request, res: Response): Promise<void> => {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    res.status(403).json({ message: "Authenticated user profile not found" });
    return;
  }

  try {
    const recentLogs = await DailyInput.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(20);

    if (recentLogs.length < 10) {
      res.status(200).json({
        notEnoughData: true,
        currentCount: recentLogs.length,
        message: "Need at least 10 entries",
      });
      return;
    }

    const newestLog: any = recentLogs[0];

    const savedPrediction: any = await Prediction.findOne({ user_id: userId });

    if (savedPrediction && savedPrediction.latest_log_id === newestLog.log_id) {
      console.log(`💾 Cache Hit: Prediction based on Log #${newestLog.log_id} already exists.`);
      res.json(savedPrediction.data);
      return;
    }

    // Cache misses call the paid AI; cap them per user.
    if (!allowRequest(`predictions:${userId}`, 10, HOUR_MS)) {
      res.status(429).json({ message: "Too many prediction updates. Please try again in an hour." });
      return;
    }

    console.log(`🆕 New Data Detected (Log #${newestLog.log_id}). Generating AI response...`);

    const sortedByDate = [...recentLogs].sort(
      (a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );

    const contextData = sortedByDate.map((raw: any) => ({
      date: raw.log_date,
      triggers: triggerLabels(raw.trigger),
      sleep: raw.sleep,
      screentime: raw.screentime,
      vmPathiScore: vmPathiScoreOf(raw),
      symptoms: raw.symptoms,
    }));

    const features = buildFeaturesFromLogs(recentLogs);

    const { data: validated, modelUsed } = await callMigraineModelWithFallback(features, contextData);

    await Prediction.findOneAndUpdate(
      { user_id: userId },
      {
        latest_log_id: newestLog.log_id,
        data: validated,
        updated_at: new Date(),
        model_used: modelUsed,
      },
      { upsert: true, new: true }
    );

    console.log(`💾 Saved new prediction to DB using model ${modelUsed}.`);
    res.json(validated);
  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ message: "Failed to generate predictions" });
  }
});

export default router;
