import express, { Request, Response } from "express";
import axios from "axios";
import DailyInput from "../models/DailyInput";
import Symptom from "../models/Symptom";
import User from "../models/User";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

type OpenRouterChatResponse = {
  choices: { message: { content: string } }[];
};

type FrontendChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ───────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const parsed = parseFloat(String(val));
  return Number.isFinite(parsed) ? parsed : null;
}

// log_date is stored as UTC midnight of the calendar day the user picked.
// Interpolating the raw Date (`${date}`) renders it in the server's local
// timezone via toString(), which can shift the day by one. Read the
// calendar day straight from the UTC fields instead.
function toDateKey(val: unknown): string {
  if (!val) return "unknown";
  const d = val instanceof Date ? val : new Date(val as any);
  if (Number.isNaN(d.getTime())) return "unknown";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

async function getAuthenticatedUserId(req: Request): Promise<number | undefined> {
  if (!req.user?.uid) return undefined;

  const user = await User.findOne({ firebase_uid: req.user.uid }).select("user_id").lean();
  return typeof user?.user_id === "number" ? user.user_id : undefined;
}

// Adjust to match your UI mapping exactly
const SEVERITY_LEGEND: Record<number, string> = {
  0: "none",
  1: "mild",
  2: "moderate",
  3: "severe",
  4: "very severe",
};

// [FIXED]: Fallback to original string if not a number (e.g. "moderate", "severe", "yes")
function severityToLabel(sev: unknown): string {
  const n = toNumber(sev);
  if (n === null) {
    return sev ? String(sev) : "unknown";
  }
  if (SEVERITY_LEGEND[n] !== undefined) return `${n} (${SEVERITY_LEGEND[n]})`;
  return `${n}`;
}

function normalizeTriggers(trg: any): string[] {
  if (!trg) return [];
  const parts = Array.isArray(trg) ? trg : String(trg).split(/[;,]/);
  return parts
    .map((p) => String(p).trim().toLowerCase())
    .filter(Boolean);
}

// Build simple log stats (sleep/screen/triggers)
function buildFeaturesFromLogs(recentLogs: any[]) {
  let sleepSum = 0;
  let sleepCount = 0;

  let screenSum = 0;
  let screenCount = 0;

  let vmPathiSum = 0;
  let vmPathiCount = 0;

  const triggerCounts: Record<string, number> = {};

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

    const vmPathiVal = toNumber(entry.vmPathiScore);
    if (vmPathiVal !== null) {
      vmPathiSum += vmPathiVal;
      vmPathiCount++;
    }

    const triggers = normalizeTriggers(entry.trigger);
    for (const t of triggers) {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
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
    avgVmPathiScore: vmPathiCount > 0 ? Number((vmPathiSum / vmPathiCount).toFixed(1)) : null,
    commonTriggers,
  };
}

// Build symptom stats from Symptom documents or directly parsed log objects
function buildSymptomStats(symptomDocs: any[]) {
  const symptomCounts: Record<string, number> = {};
  const severitySum: Record<string, number> = {};
  const severityCount: Record<string, number> = {};
  let totalSymptoms = 0;

  for (const s of symptomDocs) {
    const name = String(s.symptom_name ?? "").trim().toLowerCase();
    if (!name) continue;

    totalSymptoms++;
    symptomCounts[name] = (symptomCounts[name] || 0) + 1;

    const sev = toNumber(s.severity);
    if (sev !== null) {
      severitySum[name] = (severitySum[name] || 0) + sev;
      severityCount[name] = (severityCount[name] || 0) + 1;
    }
  }

  const commonSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([symptom, count]) => {
      const avgSev =
        severityCount[symptom] > 0
          ? Number((severitySum[symptom] / severityCount[symptom]).toFixed(1))
          : null;

      return {
        symptom,
        count,
        avgSeverity: avgSev,
        avgSeverityLabel: avgSev !== null ? severityToLabel(avgSev) : null,
      };
    });

  return {
    totalSymptoms,
    symptomLegend: Object.entries(SEVERITY_LEGEND)
      .map(([k, v]) => `${k}=${v}`)
      .join(", "),
    commonSymptoms,
  };
}

// ───────────────────────────────────────────
// LLM stack with fallbacks
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
You are "Migraine Genie", an online doctor-style chatbot focused ONLY on migraine and headache topics.

SCOPE (VERY IMPORTANT):
- You MUST ONLY answer questions that are clearly about:
  - Migraine/headache symptoms (throbbing pain, aura, light sensitivity, nausea, dizziness, fatigue, etc.)
  - Migraine triggers (sleep, stress, hormones, food, weather, screens, posture, etc.)
  - Migraine management strategies (lifestyle, routines, questions to ask a doctor)
  - Understanding migraine types, aura, chronic vs episodic migraine
  - The user's VM-PATHI score — this app's own vestibular migraine symptom severity
    index (25 items, each 0-4, summed to a 0-100 score; higher = more severe). It IS
    an in-scope migraine metric. When asked about it, report the score(s) from
    "USER DATA CONTEXT" / "RECENT DAILY LOGS" below and explain what the number means
    (e.g. trend over time, which symptoms are driving it) — do not refuse this topic.
    NEVER label the score (or its trend) as "low"/"high"/"mild"/"severe"/"good"/
    "concerning"/etc. No validated severity bands were given to you, so any such
    label is a guess, not a fact — a score being a small fraction of the 0-100 max
    does NOT mean it is clinically "low". Just state the number(s), name which
    symptom items are contributing most, and describe the trend (up/down/stable)
    neutrally, without characterizing it as good or bad.
- If the user asks about ANY OTHER health issue unrelated to migraines/vestibular migraine:
  - DO NOT answer that medical question.
  - Say you are designed only for migraine/headache topics and suggest a real clinician.

SAFETY & LIMITATIONS:
- You are NOT a real doctor and do NOT have full medical history access.
- Do NOT give a formal diagnosis.
- Do NOT promise cures.
- Encourage a real healthcare professional, especially for red flags:
  - severe sudden "worst ever" headache
  - neurological symptoms (vision changes, weakness, confusion, speech difficulty, seizures)
  - fever, neck stiffness, or head injury
- If emergency-like symptoms: advise urgent medical care.

CONTEXT YOU MAY RECEIVE:
- "Stats" (sleep/screen + common triggers)
- "Symptoms" (per-day symptoms with severity and duration)
- Symptom severity values may be numeric; a legend will be provided.

PRIORITY RULE (IMPORTANT):
- If the user asks "what symptoms have I been facing" or asks about symptom history,
  you MUST summarize symptom patterns FIRST (which symptoms, severities, durations, trends),
  and only mention triggers SECONDARY (unless they specifically ask about triggers).

STYLE:
- Empathetic, conversational, concise.
- Short paragraphs + bullets.
- Identify possible patterns (NOT diagnosing).
- Suggest generally safe migraine lifestyle strategies.

ALWAYS end with:
"This is general information about migraines, not a diagnosis. Please consult a healthcare professional for personal medical advice."
`.trim();

async function callDoctorModelWithFallback(
  userMessages: FrontendChatMessage[],
  stats: any | null,
  logs: any[] | null,
  symptomStats: any | null
): Promise<{ reply: string; modelUsed: string }> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY env var");
  }

  const statsText = stats
    ? [
        `Total logs: ${stats.totalLogs}`,
        `Avg sleep hours: ${stats.avgSleepHours ?? "n/a"}`,
        `Avg screen time hours: ${stats.avgScreenTimeHours ?? "n/a"}`,
        `Avg VM-PATHI score (0-100, vestibular migraine symptom severity index): ${stats.avgVmPathiScore ?? "n/a"}`,
        `Common triggers: ${JSON.stringify(stats.commonTriggers ?? [])}`,
      ].join("\n")
    : "No statistics available.";

  const symptomStatsText = symptomStats
    ? [
        `Total symptom entries: ${symptomStats.totalSymptoms ?? 0}`,
        `Severity legend: ${symptomStats.symptomLegend ?? "n/a"}`,
        `Common symptoms (count + avg severity): ${JSON.stringify(symptomStats.commonSymptoms ?? [])}`,
      ].join("\n")
    : "No symptom statistics available.";

  // Logs context includes symptom details per log day. `stats`/`symptomStats`
  // above already aggregate the user's ENTIRE history; this itemized list is
  // capped to the most recent entries so smaller fallback models' context
  // windows don't get blown out by a long logging history.
  const MAX_DETAILED_LOGS = 45;
  const totalLogDays = logs?.length ?? 0;
  const detailedLogs = logs ? logs.slice(0, MAX_DETAILED_LOGS) : [];
  const logContextText =
    detailedLogs.length > 0
      ? [
          totalLogDays > detailedLogs.length
            ? `(Showing the ${detailedLogs.length} most recent of ${totalLogDays} total logged days. The aggregate stats above already reflect ALL ${totalLogDays} days.)`
            : null,
          ...detailedLogs.map((l) => {
            const triggerText = Array.isArray(l.triggers)
              ? l.triggers.join(", ")
              : String(l.triggers ?? "").trim();

            const symptomsArr: any[] = Array.isArray(l.symptoms) ? l.symptoms : [];
            const symptomsText =
              symptomsArr.length > 0
                ? symptomsArr
                    .slice(0, 20) // keep prompt smaller
                    .map((s) => {
                      const name = String(s.symptom_name ?? "unknown");
                      const sev = severityToLabel(s.severity);
                      const dur = toNumber(s.duration);
                      const durText = dur !== null ? `${dur}m` : "n/a";
                      return `${name} [sev=${sev}, dur=${durText}]`;
                    })
                    .join("; ")
                : "none";

            return `- Date: ${l.date}
  Sleep: ${l.sleep ?? "n/a"}h, Screen: ${l.screentime ?? "n/a"}h
  VM-PATHI score: ${l.vmPathiScore ?? "n/a"}/100
  Triggers: ${triggerText || "none"}
  Symptoms: ${symptomsText}`;
          }),
        ]
          .filter(Boolean)
          .join("\n")
      : "No recent logs found for this user.";

  let lastError: any | null = null;

  for (const model of MODEL_SEQUENCE) {
    try {
      const messages = [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}

USER DATA CONTEXT:
${statsText}

SYMPTOM DATA CONTEXT:
${symptomStatsText}

RECENT DAILY LOGS (with symptoms):
${logContextText}

INSTRUCTIONS:
- If user asks about symptoms/history: summarize Symptoms FIRST (which symptoms, severity levels, durations, trends).
- If user asks about triggers: summarize triggers and correlate with symptoms if possible.
- If user asks about their VM-PATHI score: report the per-day score(s) and/or average from
  the context above, describe the trend, and note which symptoms likely drove it. This is
  an in-scope migraine metric — never refuse or say it's outside your scope. Do NOT call
  the score "low"/"high"/"mild"/"severe" or otherwise judge its severity — just report it.
- "USER DATA CONTEXT" (avg sleep/screen/VM-PATHI, common triggers) and "SYMPTOM DATA CONTEXT"
  are computed from the user's ENTIRE logging history. "RECENT DAILY LOGS" below may only
  itemize the most recent days (it will say so if truncated) — when summarizing overall
  trends or averages, rely on the aggregate stats above, not just the itemized days.
- Do NOT say you lack access to logs; they are provided above.`,
        },
        ...userMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await axios.post<OpenRouterChatResponse>(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages, temperature: 0.5, max_tokens: 900 },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Migraine Genie Doctor Chat",
          },
          timeout: 60000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error("Empty reply from model");

      console.log(`✅ Doctor assistant reply from ${model}`);
      return { reply, modelUsed: model };
    } catch (err: any) {
      console.error(
        `❌ Doctor assistant model ${model} failed:`,
        err?.response?.data || err?.message || err
      );
      lastError = err;
      continue;
    }
  }

  const msg =
    lastError?.response?.data
      ? JSON.stringify(lastError.response.data)
      : lastError?.message || String(lastError);

  throw new Error(`All models failed. Last error: ${msg}`);
}

// ───────────────────────────────────────────
// ROUTE: POST /api/assistant/doctor-chat
// body: { messages: {role, content}[] }
// ───────────────────────────────────────────

router.post("/doctor-chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as {
      messages: FrontendChatMessage[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: "Messages array is required." });
      return;
    }

    let stats: any | null = null;
    let symptomStats: any | null = null;
    let contextData: any[] | null = null;

    const targetUserId = await getAuthenticatedUserId(req);

    if (targetUserId !== undefined) {
      // Fetch the user's ENTIRE logging history (not just a recent window) so
      // averages/trends reflect all past entries, not a truncated slice of them.
      const recentLogs = await DailyInput.find({ user_id: targetUserId }).sort({ log_date: -1 });

      if (recentLogs.length > 0) {
        stats = buildFeaturesFromLogs(recentLogs);

        // Extract log_ids for optional separate-collection symptoms
        const logIds = recentLogs
          .map((l: any) => l.log_id)
          .filter((x: any) => x !== null && x !== undefined);

        // Pull symptoms from the separate collection as a backup / alternative source
        let collectionSymptomDocs: any[] = [];
        if (logIds.length > 0) {
          collectionSymptomDocs = await Symptom.find({
            user_id: targetUserId,
            log_id: { $in: logIds },
          }).sort({ created_at: -1 });
        }

        // Group separate collection-based symptoms by log_id
        const symptomsByLogId = new Map<number, any[]>();
        for (const s of collectionSymptomDocs) {
          const lid = toNumber((s as any).log_id);
          if (lid === null) continue;
          const arr = symptomsByLogId.get(lid) ?? [];
          arr.push({
            symptom_name: (s as any).symptom_name,
            severity: (s as any).severity,
            duration: (s as any).duration,
          });
          symptomsByLogId.set(lid, arr);
        }

        // [FIXED]: We will harvest symptoms from BOTH the embedded object (DailyInput.symptoms) 
        // AND the separate collection if available, so that stats are fully compiled either way.
        const allCompiledSymptomDocs: any[] = [];

        // 3) Build context data: each daily log + symptoms list
        contextData = [...recentLogs]
          .sort((a: any, b: any) => {
            const at = a?.log_date ? new Date(a.log_date).getTime() : 0;
            const bt = b?.log_date ? new Date(b.log_date).getTime() : 0;
            return bt - at; // Chronological order
          })
          .map((raw: any) => {
            const lidNum = toNumber(raw.log_id) ?? -1;
            let symptomsList: any[] = [];

            // Case A: Symptoms are directly inside the DailyInput as a nested object (Matches your UI)
            if (raw.symptoms && typeof raw.symptoms === "object" && !Array.isArray(raw.symptoms)) {
              symptomsList = Object.entries(raw.symptoms)
                .filter(([_, v]) => v && String(v).toLowerCase() !== "no" && String(v).toLowerCase() !== "none")
                .map(([name, value]) => {
                  const payload = {
                    symptom_name: name,
                    severity: value,
                    duration: null,
                  };
                  // Feed to stats compiler
                  allCompiledSymptomDocs.push(payload);
                  return payload;
                });
            } 
            // Case B: Fallback to collection-based symptoms (using log_id join)
            else if (lidNum !== -1) {
              symptomsList = symptomsByLogId.get(lidNum) ?? [];
              // Feed to stats compiler
              allCompiledSymptomDocs.push(...symptomsList);
            }

            return {
              date: toDateKey(raw.log_date),
              triggers: raw.trigger,
              sleep: raw.sleep,
              screentime: raw.screentime,
              vmPathiScore: toNumber(raw.vmPathiScore),
              symptoms: symptomsList,
            };
          });

        // Compute symptom statistics using the combined set
        symptomStats = buildSymptomStats(allCompiledSymptomDocs);
      }
    }

    const { reply, modelUsed } = await callDoctorModelWithFallback(
      messages,
      stats,
      contextData,
      symptomStats
    );

    res.json({ reply, modelUsed });
  } catch (err: any) {
    console.error("Doctor assistant error:", err?.message || err);
    res.status(500).json({
      message: "Failed to generate assistant reply.",
      error: err?.message || "unknown_error",
    });
  }
});

export default router;
