const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  full_name:            { type: String, required: true },
  email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash:        { type: String, required: true },
  role:                 { type: String, default: "user" },
  graduation_date:      { type: String, default: null },
  target_domain:        { type: String, default: null },
  weekly_practice_goal: { type: Number, default: 3 },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("User", userSchema);
