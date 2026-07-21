const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  settings_json: { type: String, default: null },
}, { timestamps: { createdAt: false, updatedAt: "updated_at" } });

module.exports = mongoose.model("UserSettings", userSettingsSchema);
