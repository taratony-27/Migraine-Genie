import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Firebase UID — primary auth identifier going forward
  firebase_uid: { type: String, unique: true, sparse: true },

  // Legacy numeric id kept so existing documents aren't broken
  user_id: { type: Number, unique: true, sparse: true },

  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Profile
  date_of_birth: { type: Date,   required: false },
  gender:        { type: String, enum: ["male", "female", "other"], required: false },

  // Auth provider record
  auth_provider: { type: String, enum: ["local", "google", "firebase"], default: "firebase" },

  // Legacy local-auth fields — kept nullable so old documents survive
  password_hash:              { type: String, default: null },
  email_verified:             { type: Boolean, default: true },
  email_verify_token_hash:    { type: String,  default: null },
  email_verify_token_expires_at: { type: Date, default: null },
  google_sub:                 { type: String,  default: null },

  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
