import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput';
import Prediction from '../models/Prediction';

const router = express.Router();

type OpenRouterChatResponse = {
  choices: { message: { content: string } }[];
};

type MigrainePredictionData = {
  triggers: { icon: string; label: string; risk: string }[];
  forecast: { day: string; risk: string }[];
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

  for (const rawEntry of recentLogs) {
    const entry = rawEntry as any;
    const sleepVal = toNumber(entry.sleep);
    if (sleepVal !== null) { sleepSum += sleepVal; sleepCount++; }
    
    const screenVal = toNumber(entry.screentime);
    if (screenVal !== null) { screenSum += screenVal; screenCount++; }

    const trg = entry.trigger;
    if (trg) {
      // Handle both array strings and comma-separated strings
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
    avgSleepHours: sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : "N/A",
    avgScreenTimeHours: screenCount > 0 ? (screenSum / screenCount).toFixed(1) : "N/A",
    commonTriggers,
  };
}

// GET /api/predictions/generate
router.get('/generate', async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ message: 'Missing userId' });
      return;
    }

    try {
      // --- FIX 1: Sort by 'created_at' (Creation Time) instead of 'log_date' ---
      // This ensures the entry you JUST added is always index 0, triggering the update.
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

      // 3. Identify the very latest log entry added to the DB
      const newestLog: any = recentLogs[0];

      // 4. Check DB: Do we already have a prediction for this specific Log ID?
      const savedPrediction = await Prediction.findOne({ user_id: userId });

      if (savedPrediction && savedPrediction.latest_log_id === newestLog.log_id) {
        console.log(`💾 Cache Hit: Prediction based on Log #${newestLog.log_id} already exists.`);
        res.json(savedPrediction.data);
        return;
      }

      // --- NEW PREDICTION NEEDED ---
      console.log(`🆕 New Data Detected (Log #${newestLog.log_id}). generating AI response...`);

      // 5. Format data (Sort chronologically for the AI so it sees patterns in order)
      // We explicitly sort by date here so the AI understands the timeline
      const contextData = recentLogs
        .sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()) // Sort newest date first for display
        .map((raw: any) => ({
          date: raw.log_date,
          triggers: raw.trigger,
          sleep: raw.sleep,
          screentime: raw.screentime,
          symptoms: raw.symptoms,
        }));

      // 6. Build aggregate features
      const features = buildFeaturesFromLogs(recentLogs);

      // 7. System Prompt
      const SYSTEM_PROMPT = `
        You are Migraine Genie. Analyze the provided user logs.
        
        INPUT DATA:
        - A summary of averages (sleep, screentime, top triggers).
        - A list of raw daily logs (triggers, symptoms, dates).

        YOUR TASK:
        1. Identify the strongest patterns in the data (e.g., "User gets migraines after < 6h sleep" or "User reacts to Chocolate").
        2. Generate a 7-day forecast. If the user's recent data is bad (high symptoms/triggers), risk should be high. If improving, risk is low.
        3. Recommend actions based SPECIFICALLY on the data (e.g., "Reduce screentime" only if screentime is high).

        RETURN ONLY JSON:
        {
          "triggers": [{"icon": "val", "label": "val", "risk": "High/Medium/Low Risk"}],
          "forecast": [{"day": "Mon", "risk": "20%"}], 
          "recommendations": ["string", "string"]
        }
      `;

      // 8. Call AI
      const response = await axios.post<OpenRouterChatResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { 
              role: 'user', 
              content: `Stats: ${JSON.stringify(features)}\n\nLogs: ${JSON.stringify(contextData)}` 
            },
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

      // 9. Process Response
      const aiContent = response.data?.choices?.[0]?.message?.content || "{}";
      const cleanJson = aiContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // 10. Save to DB
      await Prediction.findOneAndUpdate(
        { user_id: userId },
        {
          latest_log_id: newestLog.log_id, // Lock this prediction to this log ID
          data: parsedData,
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('💾 Saved new prediction to DB.');
      res.json(parsedData);

    } catch (err) {
      console.error('Prediction Error:', err);
      res.status(500).json({ message: 'Failed to generate predictions' });
    }
  }
);

export default router;
