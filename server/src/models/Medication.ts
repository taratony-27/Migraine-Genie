import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  medication_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  medication_name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  taken: { type: Boolean, required: true },
  notes: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Medication', MedicationSchema);
