// src/models/Prediction.ts
import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true }, // One prediction doc per user
  latest_log_id: { type: Number, required: true },         // Newest entry this prediction is based on
  logs_hash: { type: String },                              // Fingerprint of the entries used; changes when one is edited
  
  // The actual AI response
  data: {
    triggers: [
      { icon: String, label: String, risk: String }
    ],
    forecast: [
      { day: String, risk: Number }
    ],
    recommendations: [String],
    encouragement: String,
    confidence: { type: String, enum: ["Low", "Medium", "High"] }
  },
  model_used: { type: String },
  
  updated_at: { type: Date, default: Date.now }
}, { collection: 'predictions' });

export default mongoose.model('Prediction', PredictionSchema);
