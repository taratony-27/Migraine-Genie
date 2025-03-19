import mongoose from 'mongoose';

const DailyInputSchema = new mongoose.Schema({
  log_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  log_date: { type: Date, required: true },
  notes: { type: String },
  created_at: { type: Date, default: Date.now }
}, { collection: 'dailyInputs' });

export default mongoose.model('DailyInput', DailyInputSchema);
