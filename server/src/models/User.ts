import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },

  date_of_birth: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },

  // ✅ Email verification fields
  email_verified: { type: Boolean, default: false },
  email_verify_token_hash: { type: String, default: null },
  email_verify_token_expires_at: { type: Date, default: null },

  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);