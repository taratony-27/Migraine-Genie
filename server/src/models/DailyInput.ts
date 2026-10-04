// --- src/models/DailyInput.ts ---
import mongoose from 'mongoose';

const DailyInputSchema = new mongoose.Schema({
  log_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true, index: true }, // [MODIFIED] add index for fast lookups
  log_date: { type: Date, required: true },               // [UNCHANGED] but normalized in pre-save
  duration: { type: String },
  intensity: { type: String },
  sleep: { type: Number },
  screentime: { type: Number },
  trigger: { 
    potentialTrigger: { type: String },
    weather: { type: String },
    food: { type: String },
    activity: { type: String },
  },
  notes: { type: String },
  symptoms: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  vmPathiScore: { type: Number },
  created_at: { type: Date, default: Date.now }
}, { collection: 'dailyInputs' });

/**
 * [MODIFIED] Normalize log_date to start-of-day (00:00:00.000) so “distinct days” are stable.
 * Works whether client sends an ISO string or a Date object with time.
 */
DailyInputSchema.pre('save', function (next) {
  if (this.log_date instanceof Date) {
    const d = new Date(this.log_date);
    d.setHours(0, 0, 0, 0);
    this.log_date = d;
  }
  next();
});

/**
 * [MODIFIED] Enforce (optional) one entry per day per user.
 * If you *don’t* want to enforce uniqueness, change `unique: true` to `unique: false`
 * (still a helpful compound index for the count query).
 */
DailyInputSchema.index({ user_id: 1, log_date: 1 }, { unique: true }); // [MODIFIED]

export default mongoose.model('DailyInput', DailyInputSchema);
