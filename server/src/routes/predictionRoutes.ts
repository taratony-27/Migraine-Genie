import express, { Request, Response } from 'express';
import axios from 'axios';
import DailyInput from '../models/DailyInput'; 

const router = express.Router();

// GET /api/predictions/generate?userId=123
router.get('/generate', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  try {
    // 1. Fetch the last 14 days of logs for this user
    const entries = await DailyInput.find({ user_id: userId })
    .sort({ log_date: -1 }) // Sort by newest first
    .limit(20);  

    if (entries.length < 10) {
      // FIX: Do not 'return' the res.json(), just call it and return void
      res.status(200).json({ 
        notEnoughData: true, 
        currentCount: entries.length,
        message: "Need at least 10 entries" 
      });
      return; // Exit the function
    }

    // 2. Format data for the AI
    const contextData = entries.map(e => ({
      date: e.log_date,
      triggers: e.trigger,
      sleep: e.sleep,
      screentime: e.screentime,
      symptoms: e.symptoms
    }));

    console.log("------------------------------------------------");
    console.log("DATA SENT TO AI:");
    console.log(JSON.stringify(contextData, null, 2)); 
    console.log("------------------------------------------------");

    // 3. Define the prompt
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
        ],
        "recommendations": [
           "Drink 2L water",
           "Sleep at 10pm"
        ]
      }
    `;

    // 4. Send to OpenRouter (AI)
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
      }
    );

    // 5. Send the AI's answer back to the frontend
    const aiContent = response.data.choices[0].message.content;
    
    const cleanJson = aiContent
    .replace(/```json/g, '') // Remove start tag
    .replace(/```/g, '')     // Remove end tag
    .trim();                 // Remove whitespace

  try {
    const parsedData = JSON.parse(cleanJson);
    res.json(parsedData);
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    console.error("Raw AI Content was:", aiContent); 
    res.status(500).json({ message: "AI returned invalid format" });
  }

  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Failed to generate predictions" });
  }
});

export default router;