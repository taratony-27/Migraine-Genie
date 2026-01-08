import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput';

const router = express.Router();

type OpenRouterChatResponse = {
  choices: { message: { content: string } }[];
};

type FrontendChatMessage = {
  role: 'user' | 'assistant';
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

// If your symptoms are stored as 1..4 mapped from dropdown choices,
// define the meaning here. Update labels if your UI differs.
const SYMPTOM_SCALE = [
  { value: 1, label: 'mild' },
  { value: 2, label: 'moderate' },
  { value: 3, label: 'severe' },
  { value: 4, label: 'very severe' },
] as const;

function symptomLegendText(): string {
  return SYMPTOM_SCALE.map((s) => `${s.value}=${s.label}`).join(', ');
}

function formatSymptom(val: unknown): string {
  // If numeric and within 1..4, return "2 (moderate)"
  const n = toNumber(val);
  if (n !== null) {
    const matched = SYMPTOM_SCALE.find((s) => s.value === n);
    if (matched) return `${matched.value} (${matched.label})`;
    // If it looks like a 0..10 pain scale, keep it as-is but do NOT force "/10"
    return `${n}`;
  }

  // If string like "mild", return it normalized
  const s = String(val ?? '').trim().toLowerCase();
  if (!s) return 'unknown';
  return s;
}

function normalizeTriggers(trg: any): string[] {
  if (!trg) return [];
  const parts = Array.isArray(trg) ? trg : String(trg).split(/[;,]/);
  return parts
    .map((p) => String(p).trim().toLowerCase())
    .filter(Boolean);
}

function buildFeaturesFromLogs(recentLogs: any[]) {
  let sleepSum = 0;
  let sleepCount = 0;

  let screenSum = 0;
  let screenCount = 0;

  const triggerCounts: Record<string, number> = {};

  // Treat symptoms as a "severity index" if it’s 1..4; otherwise average numeric if present
  let symptomSum = 0;
  let symptomCount = 0;
  const symptomLabelCounts: Record<string, number> = {};

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

    // Symptom handling
    const symptomVal = toNumber(entry.symptoms);
    if (symptomVal !== null) {
      symptomSum += symptomVal;
      symptomCount++;
    }

    const symptomLabel = formatSymptom(entry.symptoms);
    symptomLabelCounts[symptomLabel] = (symptomLabelCounts[symptomLabel] || 0) + 1;

    // Triggers
    const triggers = normalizeTriggers(entry.trigger);
    for (const t of triggers) {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    }
  }

  const commonTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  const commonSymptomSeverities = Object.entries(symptomLabelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([severity, count]) => ({ severity, count }));

  return {
    totalLogs: recentLogs.length,
    avgSleepHours: sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(1)) : null,
    avgScreenTimeHours: screenCount > 0 ? Number((screenSum / screenCount).toFixed(1)) : null,

    // IMPORTANT: this is "avg symptom value" (could be 1..4 index OR some other numeric)
    avgSymptomValue: symptomCount > 0 ? Number((symptomSum / symptomCount).toFixed(1)) : null,

    commonTriggers,
    commonSymptomSeverities,
    symptomLegend: symptomLegendText(),
  };
}

// ───────────────────────────────────────────
// LLM stack with fallbacks
// ───────────────────────────────────────────

// Adjust slugs as needed to match your OpenRouter dashboard
const MODEL_SEQUENCE: string[] = [
  'openai/gpt-4o-mini',
  'google/gemma-3-27b-it',
  'google/gemma-3-12b-it',
  'google/gemma-3-4b-it',
  'google/gemini-2.0-flash-exp',
  'meta-llama/llama-3.3-70b-instruct',
  'meta-llama/llama-3.2-3b-instruct',
  'nousresearch/hermes-3-llama-3.1-405b',
  'mistralai/mistral-7b-instruct',
];

/**
 * MIGRAINE-ONLY system prompt.
 */
const SYSTEM_PROMPT = `
You are "Migraine Genie", an online doctor-style chatbot focused ONLY on migraine and headache topics.

SCOPE (VERY IMPORTANT):
- You MUST ONLY answer questions that are clearly about:
  - Migraine or headache symptoms (e.g., throbbing pain, aura, light sensitivity, nausea).
  - Migraine triggers (sleep, stress, hormones, food, weather, screens, posture, etc.).
  - Migraine management strategies (lifestyle, routines, questions to ask a doctor).
  - Understanding migraine types, aura, chronic vs episodic migraine.
- If the user asks about ANY OTHER health issue:
  - DO NOT answer their medical question.
  - Politely say you are only designed to talk about migraine/headache-related issues.
  - Suggest they talk to a real doctor for the other concern.

SAFETY & LIMITATIONS:
- You are NOT a real doctor and you do NOT have access to a full medical history.
- You MUST NOT give a formal diagnosis.
- You MUST NOT claim that a particular treatment will definitely cure the user.
- Encourage seeing a healthcare professional, especially for red flags:
  - severe, sudden, "worst ever" headache
  - neurological symptoms (vision changes, weakness, confusion, speech difficulty, seizures)
  - fever, neck stiffness, or head injury
- If emergency-like symptoms are described: advise urgent medical care.

CONTEXT YOU MAY RECEIVE:
- "Stats": aggregated migraine log data
- "Logs": recent daily entries containing date, triggers, sleep, screentime, symptoms

STYLE AND BEHAVIOR:
- Be empathetic, conversational, and concise.
- Use short paragraphs and bullet points when helpful.
- Identify possible patterns (NOT diagnosing).
- Suggest generally safe migraine lifestyle strategies.
- Explain what to monitor and what to ask a real doctor/neurologist.

NON-MIGRAINE HANDLING (STRICT):
- If the latest user message is primarily about a non-migraine health topic:
  - respond that you only handle migraine/headache topics, and suggest a real clinician for the other concern
  - do NOT partly answer the non-migraine question

ALWAYS end with:
"This is general information about migraines, not a diagnosis. Please consult a healthcare professional for personal medical advice."
`.trim();

async function callDoctorModelWithFallback(
  userMessages: FrontendChatMessage[],
  stats: any | null,
  logs: any[] | null,
): Promise<{ reply: string; modelUsed: string }> {
  // Create a text block for the logs
  // IMPORTANT: Do NOT force "/10" unless your data is truly 0..10.
  const logContextText =
    logs && logs.length > 0
      ? logs
          .map((l) => {
            const symptomStr = formatSymptom(l.symptoms);
            const triggers = Array.isArray(l.triggers)
              ? l.triggers.join(', ')
              : String(l.triggers ?? '').trim();

            return `- Date: ${l.date}, Symptoms/Severity: ${symptomStr}, Triggers: ${triggers || 'none'}, Sleep: ${l.sleep ?? 'n/a'}h, Screen: ${l.screentime ?? 'n/a'}h`;
          })
          .join('\n')
      : 'No recent logs found for this user.';

  const statsText = stats
    ? [
        `Total logs: ${stats.totalLogs}`,
        `Avg sleep hours: ${stats.avgSleepHours ?? 'n/a'}`,
        `Avg screen time hours: ${stats.avgScreenTimeHours ?? 'n/a'}`,
        `Avg symptom value: ${stats.avgSymptomValue ?? 'n/a'}`,
        `Symptom scale legend (if numeric): ${stats.symptomLegend ?? symptomLegendText()}`,
        `Common symptom severities: ${JSON.stringify(stats.commonSymptomSeverities ?? [])}`,
        `Common triggers: ${JSON.stringify(stats.commonTriggers ?? [])}`,
      ].join('\n')
    : 'No statistics available.';

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY env var');
  }

  let lastError: any | null = null;

  for (const model of MODEL_SEQUENCE) {
    try {
      const messages = [
        {
          role: 'system',
          // Merge instructions AND data into one system message
          content: `${SYSTEM_PROMPT}

USER DATA CONTEXT (Use this to answer questions):
${statsText}

RECENT USER LOGS:
${logContextText}

INSTRUCTIONS:
- If the user asks about their symptoms history, summarize the "Symptoms/Severity" pattern from the logs above.
- If symptoms are numeric, use the legend to interpret them.
- Do NOT say you lack access to logs; the logs are provided above.`,
        },
        ...userMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await axios.post<OpenRouterChatResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages, temperature: 0.5, max_tokens: 900 },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'Migraine Genie Doctor Chat',
          },
          timeout: 60000,
        },
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error('Empty reply from model');

      console.log(`✅ Doctor assistant reply from ${model}`);
      return { reply, modelUsed: model };
    } catch (err: any) {
      console.error(
        `❌ Doctor assistant model ${model} failed:`,
        err?.response?.data || err?.message || err,
      );
      lastError = err;
      continue;
    }
  }

  // Include lastError details to help debugging
  const msg =
    lastError?.response?.data
      ? JSON.stringify(lastError.response.data)
      : lastError?.message || String(lastError);

  throw new Error(`All models failed. Last error: ${msg}`);
}

// ───────────────────────────────────────────
// ROUTE: POST /api/assistant/doctor-chat
// body: { userId?: string | number, messages: {role, content}[] }
// ───────────────────────────────────────────

router.post('/doctor-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, messages } = req.body as {
      userId?: string | number;
      messages: FrontendChatMessage[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: 'Messages array is required.' });
      return;
    }

    let stats: any | null = null;
    let contextData: any[] | null = null;

    if (userId) {
      // Pull last 20 migraine logs for this user to give the LLM context
      const recentLogs = await DailyInput.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(20);

      if (recentLogs.length > 0) {
        stats = buildFeaturesFromLogs(recentLogs);

        // Sort by log_date if present; fall back to created_at
        contextData = [...recentLogs]
          .sort((a: any, b: any) => {
            const at = a?.log_date ? new Date(a.log_date).getTime() : new Date(a.created_at).getTime();
            const bt = b?.log_date ? new Date(b.log_date).getTime() : new Date(b.created_at).getTime();
            return bt - at;
          })
          .map((raw: any) => ({
            date: raw.log_date ?? raw.created_at ?? 'unknown',
            triggers: raw.trigger, // keep raw; formatter will handle array/string
            sleep: raw.sleep,
            screentime: raw.screentime,
            symptoms: raw.symptoms,
          }));
      }
    }

    const { reply, modelUsed } = await callDoctorModelWithFallback(messages, stats, contextData);

    res.json({ reply, modelUsed, statsUsed: stats ? true : false });
  } catch (err: any) {
    console.error('Doctor assistant error:', err?.message || err);
    res.status(500).json({
      message: 'Failed to generate assistant reply.',
      error: err?.message || 'unknown_error',
    });
  }
});

export default router;
