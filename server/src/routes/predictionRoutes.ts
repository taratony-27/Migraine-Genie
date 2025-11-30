import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput';
import Prediction from '../models/Prediction';

const router = express.Router();

type OpenRouterChatResponse = {
  choices: { message: { content: string } }[];
};

type TriggerRisk = {
  icon: string;
  label: string;
  risk: string; // "High Risk", "Medium Risk", "Low Risk"
};

type ForecastDay = {
  day: string;   // e.g. "Day 1", "Mon", "2025-11-30"
  risk: number;  // 0–100 (no % sign)
};

export type MigrainePredictionData = {
  triggers: TriggerRisk[];
  forecast: ForecastDay[];
  recommendations: string[];
};

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
      // Handle both arrays and comma/semicolon-separated strings
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

/**
 * Basic shape validation for the LLM JSON.
 * Throws if the structure is not usable.
 */
function validatePredictionData(raw: any): MigrainePredictionData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Prediction data is not an object.');
  }

  if (!Array.isArray(raw.triggers)) {
    throw new Error('Prediction data missing triggers array.');
  }
  if (!Array.isArray(raw.forecast)) {
    throw new Error('Prediction data missing forecast array.');
  }
  if (!Array.isArray(raw.recommendations)) {
    throw new Error('Prediction data missing recommendations array.');
  }

  const triggers: TriggerRisk[] = raw.triggers.map((t: any) => ({
    icon: typeof t.icon === 'string' ? t.icon : '',
    label: typeof t.label === 'string' ? t.label : 'Unknown trigger',
    risk: typeof t.risk === 'string' ? t.risk : 'Medium Risk',
  }));

  // Ensure exactly 7 days
  const forecast: ForecastDay[] = raw.forecast.slice(0, 7).map((d: any, idx: number) => {
    const riskNum = typeof d.risk === 'number'
      ? d.risk
      : parseInt(String(d.risk), 10);

    return {
      day: typeof d.day === 'string' ? d.day : `Day ${idx + 1}`,
      risk: Number.isFinite(riskNum) ? Math.min(Math.max(riskNum, 0), 100) : 0,
    };
  });

  if (forecast.length < 7) {
    // Pad if the model under-returns
    const padCount = 7 - forecast.length;
    for (let i = 0; i < padCount; i++) {
      forecast.push({
        day: `Day ${forecast.length + 1}`,
        risk: forecast[forecast.length - 1]?.risk ?? 50,
      });
    }
  }

  const recommendations: string[] = raw.recommendations
    .filter((r: any) => typeof r === 'string')
    .map((r: string) => r.trim())
    .filter(Boolean);

  return { triggers, forecast, recommendations };
}

// GET /api/predictions/generate
router.get('/generate', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ message: 'Missing userId' });
    return;
  }

  try {
    // 1. Grab latest logs (by creation time so newest DB insert is first)
    const recentLogs = await DailyInput.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(20);

    if (recentLogs.length < 10) {
      res.status(200).json({
        notEnoughData: true,
        currentCount: recentLogs.length,
        message: 'Need at least 10 entries',
      });
      return;
    }

    // 2. Latest log entry
    const newestLog: any = recentLogs[0];

    // 3. Check for cached prediction for this latest log
    const savedPrediction = await Prediction.findOne({ user_id: userId });

    if (savedPrediction && savedPrediction.latest_log_id === newestLog.log_id) {
      console.log(`💾 Cache Hit: Prediction based on Log #${newestLog.log_id} already exists.`);
      res.json(savedPrediction.data);
      return;
    }

    console.log(`🆕 New Data Detected (Log #${newestLog.log_id}). Generating AI response...`);

    // 4. Prepare logs in reverse-chronological order for LLM
    const sortedByDate = [...recentLogs].sort(
      (a: any, b: any) =>
        new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );

    const contextData = sortedByDate.map((raw: any) => ({
      date: raw.log_date,
      triggers: raw.trigger,
      sleep: raw.sleep,
      screentime: raw.screentime,
      symptoms: raw.symptoms,
    }));

    // 5. Aggregate features for the LLM
    const features = buildFeaturesFromLogs(recentLogs);

    // 6. Stronger system prompt
    const SYSTEM_PROMPT = `
You are "Migraine Genie", an assistant that analyzes migraine-related logs.

INPUT:
- "Stats": aggregated values (avgSleepHours, avgScreenTimeHours, avgSymptomScore, totalLogs, commonTriggers[]).
- "Logs": recent daily entries [{ date, triggers, sleep, screentime, symptoms }], with the most recent entries first.

YOUR JOB (READ CAREFULLY):

1. Patterns
   - Identify the clearest patterns that connect:
     * low sleep or irregular sleep with symptoms,
     * high screentime with symptoms,
     * specific triggers with symptom spikes.
   - Reference concrete behaviors when you give recommendations.

2. 7-Day Forecast
   - Produce exactly 7 days of forecast.
   - Each day must have:
       { "day": "string", "risk": number }
     where:
       - "day" is any readable label ("Day 1", date string, or weekday).
       - "risk" is an INTEGER between 0 and 100 (no percent sign, not a string).
   - Do NOT use a perfectly monotonic pattern like 80, 70, 60, 50, 40, 30, 20.
     The forecast must have realistic variation.
   - Use the last ~14 days of logs to decide the overall level:
       * If recent days are clearly worse than earlier days
         (more symptoms, less sleep, more triggers),
         set higher upcoming risk (e.g. 60–90).
       * If recent days show improvement, lower the risk (e.g. 10–50).
       * Day-to-day variation is allowed, but must stay in a plausible band.

3. Recommendations
   - Give 3–6 concrete, specific recommendations.
   - They must be clearly tied to this user's actual data:
       * Only talk about screentime if screentime is often high.
       * Only talk about sleep if sleep is often low or very irregular.
       * Call out specific frequent triggers by name.
   - No generic "drink water and exercise" unless it connects directly to patterns you see.

RESPONSE FORMAT:
Return ONLY a single JSON object, no markdown, no explanation, matching exactly:

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
  "recommendations": ["string", "string", "..."]
}
`.trim();

    // 7. Call LLM via OpenRouter
    const response = await axios.post<OpenRouterChatResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Stats: ${JSON.stringify(features)}\n\nLogs: ${JSON.stringify(
              contextData
            )}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 700,
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

    // 8. Process LLM response
    const aiContent = response.data?.choices?.[0]?.message?.content || '{}';
    console.log('AI RAW CONTENT:', aiContent);

    // Safety: strip any accidental code fences
    const cleanJson = aiContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error('❌ Failed to parse AI JSON:', e);
      throw new Error('LLM returned invalid JSON.');
    }

    const validated = validatePredictionData(parsed);

    // 9. Save to DB
    await Prediction.findOneAndUpdate(
      { user_id: userId },
      {
        latest_log_id: newestLog.log_id,
        data: validated,
        updated_at: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log('💾 Saved new prediction to DB.');
    res.json(validated);
  } catch (err) {
    console.error('Prediction Error:', err);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
});

export default router;
