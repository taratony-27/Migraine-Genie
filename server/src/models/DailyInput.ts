// --- src/models/DailyInput.ts ---
import mongoose from 'mongoose';

const DailyInputSchema = new mongoose.Schema({
  log_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  log_date: { type: Date, required: true },
  duration: { type: String },
  intensity: { type: String },
  trigger: { type: String },
  notes: { type: String },
  symptoms: {
    type: mongoose.Schema.Types.Mixed,  // allows storing any shape
    default: {}
  },
  created_at: { type: Date, default: Date.now }
}, { collection: 'dailyInputs' });

export default mongoose.model('DailyInput', DailyInputSchema);
