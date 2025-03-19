import mongoose from 'mongoose';

const SymptomSchema = new mongoose.Schema({
  symptom_id: { type: Number, required: true, unique: true },
  symptom_group_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  log_id: { type: Number, required: true },
  symptom_name: { type: String, required: true },
  severity: { type: Number, required: true },
  duration: { type: Number, required: true }, // duration in minutes
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Symptom', SymptomSchema);
