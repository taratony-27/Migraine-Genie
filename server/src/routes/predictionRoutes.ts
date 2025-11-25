import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput';
import Prediction from '../models/Prediction'; // <--- Import the new model

const router = express.Router();

// GET /api/predictions/generate?userId=123
router.get('/generate', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ message: "Missing userId" });
    return;
  }

  try {
    // 1. Fetch the user's recent logs (Last 20)
    // We sort by log_date descending so [0] is the newest entry
    const recentLogs = await DailyInput.find({ user_id: userId })
      .sort({ log_date: -1 }) 
      .limit(20); 

    // Check: Do they have enough logs?
    if (recentLogs.length < 10) {
      res.status(200).json({ 
        notEnoughData: true, 
        currentCount: recentLogs.length,
        message: "Need at least 10 entries" 
      });
      return;
    }

    // 2. Identify the very latest log entry
    const newestLog = recentLogs[0]; 

    // 3. CHECK DB: Do we already have a prediction for this EXACT log ID?
    const savedPrediction = await Prediction.findOne({ user_id: userId });

    // If we have a prediction AND it was made for this specific log ID...
    if (savedPrediction && savedPrediction.latest_log_id === newestLog.log_id) {
      console.log(`💾 Prediction up-to-date (Log #${newestLog.log_id}). Returning cached version.`);
      
      // Return the saved data immediately (No AI call cost!)
      res.json(savedPrediction.data);
      return; 
    }

    // --- IF WE REACH HERE, WE NEED A NEW PREDICTION ---
    console.log(`🆕 New entry detected (Log #${newestLog.log_id}). Asking AI...`);

    // 4. Format data for the AI (Use all 20 logs for context)
    const contextData = recentLogs.map(e => ({
      date: e.log_date,
      triggers: e.trigger,
      sleep: e.sleep,
      screentime: e.screentime,
      symptoms: e.symptoms
    }));

    // 5. Define the Prompt
    const SYSTEM_PROMPT = `
      You are Migraine Genie. Analyze the user's recent logs.
      Predict the migraine risk for the next 7 days.
      
      Return ONLY valid JSON in this exact format:
      {
        "triggers": [
           {"icon": "🛌", "label": "Lack of Sleep", "risk": "High Risk"},
           {"icon": "💧", "label": "Dehydration", "risk": "Low Risk"}
        ],
        "forecast": [
           {"day": "Mon", "risk": "20%"},
           {"day": "Tue", "risk": "80%"}
           // ... ensure 7 days total
        ],
        "recommendations": [
           "Drink 2L water",
           "Sleep at 10pm"
        ]
      }
    `;

    // 6. Call OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", 
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(contextData) },
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost", 
          "X-Title": "Migraine Genie",        
        },
        timeout: 60000 // 60s timeout
      }
    );

    // 7. Clean and Parse AI Response
    const aiContent = response.data.choices[0].message.content;
    const cleanJson = aiContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedData = JSON.parse(cleanJson);

    // 8. SAVE (Upsert) to Database
    // This overwrites the old prediction with the new one + the new Log ID
    await Prediction.findOneAndUpdate(
      { user_id: userId },
      { 
        latest_log_id: newestLog.log_id, // Important: Mark this prediction as "done" for this log ID
        data: parsedData,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );

    console.log("💾 Saved new prediction to DB.");
    
    // 9. Send to Frontend
    res.json(parsedData);

  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Failed to generate predictions" });
  }
});

export default router;