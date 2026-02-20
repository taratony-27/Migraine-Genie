import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // local auth
  password_hash: { type: String, required: false, default: null },

  date_of_birth: { type: Date, required: false },
  gender: { type: String, enum: ["male", "female", "other"], required: false },

  // ✅ email verification
  email_verified: { type: Boolean, default: false },
  email_verify_token_hash: { type: String, default: null },
  email_verify_token_expires_at: { type: Date, default: null },

  // ✅ google auth
  auth_provider: { type: String, enum: ["local", "google"], default: "local" },
  google_sub: { type: String, default: null }, // Google "sub" user id

  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);