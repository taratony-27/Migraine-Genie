import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput';
import Prediction from '../models/Prediction';

const router = express.Router();

/**
 * Shape of the OpenRouter chat completion response we care about.
 */
type OpenRouterChatResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

/**
 * Shape of the prediction data you expect back from the model.
 * This matches your Prediction model's `data` field.
 */
type MigrainePredictionData = {
  triggers: {
    icon: string;
    label: string;
    risk: string;
  }[];
  forecast: {
    day: string;
    risk: string;
  }[];
  recommendations: string[];
};

/**
 * Small helper to safely coerce a value into a number (for sleep / screentime).
 */
function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;

  const parsed = parseFloat(String(val));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Extract aggregate features from the logs
 * to give the model clearer signals.
 *
 * NOTE: recentLogs is typed as `any[]` on purpose to avoid fighting
 * Mongoose's complex Document typings here.
 */
function buildFeaturesFromLogs(recentLogs: any[]) {
  let sleepSum = 0;
  let sleepCount = 0;
  let screenSum = 0;
  let screenCount = 0;

  const triggerCounts: Record<string, number> = {};

  for (const rawEntry of recentLogs) {
    const entry = rawEntry as any;

    // Sleep stats
    const sleepVal = toNumber(entry.sleep);
    if (sleepVal !== null) {
      sleepSum += sleepVal;
      sleepCount += 1;
    }

    // Screentime stats
    const screenVal = toNumber(entry.screentime);
    if (screenVal !== null) {
      screenSum += screenVal;
      screenCount += 1;
    }

    // Triggers: your schema has `trigger`, not `triggers`
    const trg = entry.trigger;
    if (Array.isArray(trg)) {
      for (const t of trg) {
        const key = String(t).trim().toLowerCase();
        if (!key) continue;
        triggerCounts[key] = (triggerCounts[key] || 0) + 1;
      }
    } else if (typeof trg === 'string') {
      // Split on commas/semicolons; heuristic
      const parts = trg.split(/[;,]/);
      for (const p of parts) {
        const key = p.trim().toLowerCase();
        if (!key) continue;
        triggerCounts[key] = (triggerCounts[key] || 0) + 1;
      }
    }
  }

  const avgSleepHours =
    sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(2)) : null;
  const avgScreenTimeHours =
    screenCount > 0 ? Number((screenSum / screenCount).toFixed(2)) : null;

  const commonTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  return {
    totalLogs: recentLogs.length,
    avgSleepHours,
    avgScreenTimeHours,
    commonTriggers,
  };
}

// GET /api/predictions/generate?userId=123
router.get(
  '/generate',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ message: 'Missing userId' });
      return;
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set');
      res.status(500).json({ message: 'Server misconfiguration' });
      return;
    }

    try {
      // 1. Fetch the user's recent logs (Last 20; newest first)
      const recentLogs = await DailyInput.find({ user_id: userId })
        .sort({ log_date: -1 })
        .limit(20);

      // 2. Check: Do they have enough logs?
      if (recentLogs.length < 10) {
        res.status(200).json({
          notEnoughData: true,
          currentCount: recentLogs.length,
          message: 'Need at least 10 entries',
        });
        return;
      }

      // 3. Identify the very latest log entry
      const newestLog: any = recentLogs[0];

      // 4. Check DB: Do we already have a prediction for this user?
      const savedPrediction = await Prediction.findOne({ user_id: userId });

      // If we have a prediction AND it was made for this specific log ID...
      if (
        savedPrediction &&
        savedPrediction.latest_log_id === newestLog.log_id
      ) {
        console.log(
          `💾 Prediction up-to-date (Log #${newestLog.log_id}). Returning cached version.`
        );
        res.json(savedPrediction.data);
        return;
      }

      // --- IF WE REACH HERE, WE NEED A NEW PREDICTION ---
      console.log(
        `🆕 New entry detected (Log #${newestLog.log_id}). Asking AI...`
      );

      // 5. Format data for the AI (Use all 20 logs for context)
      const contextData = recentLogs.map((raw: any) => {
        const e = raw as any;
        return {
          date: e.log_date,
          // Important: your model has `trigger`, not `triggers`
          triggers: e.trigger,
          sleep: e.sleep,
          screentime: e.screentime,
          symptoms: e.symptoms,
        };
      });

      // 6. Build aggregate features to reduce randomness
      const features = buildFeaturesFromLogs(recentLogs as any[]);

      // 7. Define the System Prompt (optimized)
      const SYSTEM_PROMPT = `
You are Migraine Genie, an assistant that predicts migraine risk based
ONLY on the user's historical logs that will be provided.

CRITICAL RULES:
- You must base all triggers, forecast, and recommendations ONLY on the patterns
  that appear in the logs (sleep, screentime, triggers, symptoms, dates).
- If a trigger or recommendation is not clearly connected to something in the logs,
  you MUST NOT mention it.
- If you don't have enough consistent evidence for a specific trigger, mark it
  as "Low Risk" or omit it.
- NEVER invent medical diagnoses, and NEVER override medical advice. You are only
  helping the user see patterns in their own data.

HOW TO ANALYZE:
1. Look at the last 10–20 entries.
2. Identify recurring patterns:
   - Frequently mentioned triggers (e.g. "stress", "light", "screen").
   - Bad sleep nights (e.g. < 6 hours) or irregular sleep patterns.
   - Very high screentime days.
   - Days with strong symptoms (e.g. "severe", "throbbing", "nausea").
3. Connect these patterns to higher or lower migraine risk on upcoming days.

SCORING TENDENCIES (GUIDELINES, NOT HARD RULES):
- If average sleep across the last logs is < 6 hours,
  or at least 3 of the last 7 nights are clearly short sleep,
  "Lack of Sleep" should be at least "Medium Risk", usually "High Risk".
- If screentime is high on many days (e.g. > 6 hours on at least 3 of the last 7 days),
  "Screen Time" should be "Medium" or "High Risk".
- If a trigger word appears in around 30% or more of the logs
  (e.g. "stress", "light", "noise"),
  include it as a trigger with "Medium" or "High Risk".
- If severe symptoms cluster around certain patterns (e.g. poor sleep + high screentime),
  increase risk for upcoming days that resemble those patterns.

FORECAST:
- Use the patterns from the last 7–10 days to estimate the next 7 days.
- If the recent week was overall bad (many triggers, bad sleep, high screentime),
  keep the risk higher for the next few days unless there are clear improving trends.
- If the recent week shows improvement, lower the risk gradually.

RECOMMENDATIONS:
- Always tie recommendations directly to what you saw in the logs.
  Example: If most nights show sleep < 6 hours, explicitly recommend a target bedtime.
  If screentime is high late at night, recommend cutting screens 1–2 hours before bed.

OUTPUT FORMAT (STRICT JSON, NO EXPLANATION OUTSIDE JSON):
{
  "triggers": [
    { "icon": "🛌", "label": "Lack of Sleep", "risk": "High Risk" },
    { "icon": "💻", "label": "Screen Time", "risk": "Medium Risk" }
  ],
  "forecast": [
    { "day": "Mon", "risk": "20%" },
    { "day": "Tue", "risk": "80%" }
  ],
  "recommendations": [
    "Go to bed before 11pm at least 5 nights this week",
    "Limit screentime to under 5 hours on high-risk days"
  ]
}

You MUST return ONLY valid JSON of that shape. No extra text or commentary.
      `.trim();

      // 8. Build the user message, including features + logs
      const userMessage = `
Here are this user's migraine log features and raw logs.

First, aggregated features computed from the logs:
${JSON.stringify(features, null, 2)}

Then, here are the raw logs (newest first):
${JSON.stringify(contextData, null, 2)}

Using ONLY this information, produce the JSON in the exact format described
in the system prompt.
      `.trim();

      // 9. Call OpenRouter
      const response = await axios.post<OpenRouterChatResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'Migraine Genie',
          },
          timeout: 60000,
        }
      );

      const aiContent = response.data?.choices?.[0]?.message?.content;
      if (!aiContent) {
        console.error('No content in OpenRouter response:', response.data);
        res.status(502).json({ message: 'No prediction generated' });
        return;
      }

      // 10. Clean and parse AI response
      const cleanJson = aiContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      let parsedData: MigrainePredictionData;
      try {
        parsedData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error(
          'Failed to parse AI JSON:',
          parseErr,
          'Raw content:',
          aiContent
        );
        res.status(502).json({ message: 'Invalid prediction format from AI' });
        return;
      }

      // 11. Save (upsert) to database
      await Prediction.findOneAndUpdate(
        { user_id: userId },
        {
          latest_log_id: newestLog.log_id,
          data: parsedData,
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('💾 Saved new prediction to DB.');

      // 12. Send to frontend
      res.json(parsedData);
    } catch (err) {
      console.error('Prediction Error:', err);
      res.status(500).json({ message: 'Failed to generate predictions' });
    }
  }
);

export default router;
