import mongoose from 'mongoose';

const TriggerSchema = new mongoose.Schema({
  trigger_id: { type: Number, required: true, unique: true },
  log_id: { type: Number, required: true },
  symptom_group_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  weather: { type: String },
  temperature: { type: Number },
  humidity: { type: Number },
  pressure: { type: Number },
  diet: { type: String },
  sleep_hours: { type: Number },
  stress_level: { type: Number },
  period_cycle: { type: Boolean },
  physical_activity: { type: String },
  screen_time: { type: Number },
  lighting: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Trigger', TriggerSchema);
