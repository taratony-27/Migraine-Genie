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
// Shared helpers (similar to predictions)
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
  let symptomSum = 0;
  let symptomCount = 0;

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

    const symptomVal = toNumber(entry.symptoms);
    if (symptomVal !== null) {
      symptomSum += symptomVal;
      symptomCount++;
    }

    const trg = entry.trigger;
    if (trg) {
      const parts = Array.isArray(trg) ? trg : String(trg).split(/[;,]/);
      for (const p of parts) {
        const key = String(p).trim().toLowerCase();
        if (key) triggerCounts[key] = (triggerCounts[key] || 0) + 1;
      }
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
    avgSymptomScore: symptomCount > 0 ? Number((symptomSum / symptomCount).toFixed(1)) : null,
    commonTriggers,
  };
}

// ───────────────────────────────────────────
// LLM stack with fallbacks (reuse sequence)
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
 * Refuses other health topics, stays in "chatbot" style.
 */
const SYSTEM_PROMPT = `
You are "Migraine Genie", an online doctor-style chatbot focused ONLY on migraine and headache topics.

SCOPE (VERY IMPORTANT):
- You MUST ONLY answer questions that are clearly about:
  - Migraine or headache symptoms (e.g., throbbing pain, aura, light sensitivity, nausea).
  - Migraine triggers (sleep, stress, hormones, food, weather, screens, posture, etc.).
  - Migraine management strategies (lifestyle, routines, questions to ask a doctor).
  - Understanding migraine types, aura, chronic vs episodic migraine.
- If the user asks about ANY OTHER health issue (for example: diabetes, heart disease, cancer, infections, pregnancy management, medications unrelated to migraine, mental health disorders, skin issues, injuries, etc.):
  - DO NOT answer their medical question.
  - Instead, politely say that you are only designed to talk about migraine and headache-related issues and cannot give advice on other health topics.
  - Then, if possible, gently steer them toward discussing how migraines affect them, or suggest they talk to a real doctor for their other concern.

SAFETY & LIMITATIONS:
- You are NOT a real doctor and you do NOT have access to a full medical history.
- You MUST NOT give a formal diagnosis.
- You MUST NOT claim that a particular treatment will definitely cure the user.
- You MUST always encourage the user to consult a real healthcare professional, especially for:
  - Severe, sudden, or "worst ever" headaches.
  - Neurological symptoms (vision changes, weakness, confusion, speech difficulty, seizures).
  - Fever, neck stiffness, or head injury.
- If the user describes emergency-like symptoms, clearly advise them to seek urgent medical care or emergency services.

CONTEXT YOU MAY RECEIVE:
- "Stats": aggregated migraine log data (avgSleepHours, avgScreenTimeHours, avgSymptomScore, commonTriggers, totalLogs).
- "Logs": recent daily entries containing date, triggers, sleep, screentime, symptoms.
- Use this context to tailor advice:
  - If screentime is often high, discuss screen breaks, blue light, ergonomics.
  - If sleep is low or irregular, discuss sleep routine and consistency.
  - If certain triggers are frequent, mention them explicitly and suggest experiments.

STYLE AND BEHAVIOR:
- Be empathetic, conversational, and concise.
- Use short paragraphs and bullet points when helpful.
- Focus on:
  - Identifying possible migraine patterns (NOT diagnosing).
  - Suggesting generally safe lifestyle strategies related to migraine.
  - Explaining what to monitor and what to bring up with a real doctor or neurologist.
- Never tell the user to ignore their doctor's advice. If there's conflict, encourage them to clarify with their doctor.

NON-MIGRAINE HANDLING (STRICT):
- If the latest user message is primarily about a non-migraine health topic:
  - Respond with something like:
    "I'm designed specifically to help with migraine and headache questions, so I can't safely advise on that other health issue. Please speak with a healthcare professional about it. If you'd like to discuss your migraines or headaches, I'm here to help."
  - Do NOT attempt to partly answer the non-migraine question.

ALWAYS end your reply with a short reminder like:
"This is general information about migraines, not a diagnosis. Please consult a healthcare professional for personal medical advice."
`.trim();

async function callDoctorModelWithFallback(
  userMessages: FrontendChatMessage[],
  stats: any | null,
  logs: any[] | null,
): Promise<{ reply: string; modelUsed: string }> {
  
  // Create a text block for the logs
  const logContextText = (logs && logs.length > 0) 
    ? logs.map(l => `- Date: ${l.date}, Pain: ${l.symptoms}/10, Triggers: ${l.triggers}, Sleep: ${l.sleep}h`).join('\n')
    : "No recent logs found for this user.";

  const statsText = stats 
    ? `Avg Sleep: ${stats.avgSleepHours}, Common Triggers: ${JSON.stringify(stats.commonTriggers)}`
    : "No statistics available.";

  for (const model of MODEL_SEQUENCE) {
    try {
      const messages = [
        { 
          role: 'system', 
          // 💡 CRUCIAL: We merge the instructions AND the data into one single System Prompt
          content: `${SYSTEM_PROMPT}
          
          USER DATA CONTEXT (Use this to answer questions):
          ${statsText}

          RECENT USER LOGS:
          ${logContextText}
          
          INSTRUCTION: If the user asks about their history, refer to the data above. 
          Do NOT tell the user you don't have access to their logs, because the data is provided right here.`
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
          },
          timeout: 60000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error('Empty reply');
      return { reply, modelUsed: model };
    } catch (err: any) {
      console.error(`❌ Model ${model} failed`, err.message);
      continue;
    }
  }
  throw new Error("All models failed.");
}

// ───────────────────────────────────────────
// ROUTE: POST /api/assistant/doctor-chat
// body: { userId?: string | number, messages: {role, content}[] }
// ───────────────────────────────────────────

router.post(
  '/doctor-chat',
  async (req: Request, res: Response): Promise<void> => {
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

          contextData = [...recentLogs]
            .sort(
              (a: any, b: any) =>
                new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
            )
            .map((raw: any) => ({
              date: raw.log_date,
              triggers: raw.trigger,
              sleep: raw.sleep,
              screentime: raw.screentime,
              symptoms: raw.symptoms,
            }));
        }
      }

      const { reply, modelUsed } = await callDoctorModelWithFallback(
        messages,
        stats,
        contextData
      );

      res.json({ reply, modelUsed });
    } catch (err) {
      console.error('Doctor assistant error:', err);
      res
        .status(500)
        .json({ message: 'Failed to generate assistant reply.' });
    }
  }
);

export default router;
