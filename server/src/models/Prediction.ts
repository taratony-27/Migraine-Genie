// src/models/Prediction.ts
import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true }, // One prediction doc per user
  latest_log_id: { type: Number, required: true },         // THE KEY: Tracks which entry this prediction is based on
  
  // The actual AI response
  data: {
    triggers: [
      { icon: String, label: String, risk: String }
    ],
    forecast: [
      { day: String, risk: String }
    ],
    recommendations: [String]
  },
  
  updated_at: { type: Date, default: Date.now }
}, { collection: 'predictions' });

export default mongoose.model('Prediction', PredictionSchema);