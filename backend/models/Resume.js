const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  user_id:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resume_text:       { type: String, default: null },
  skills:            { type: String, default: null },
  experience:        { type: String, default: null },
  parsed_json:       { type: String, default: null },
  is_active:         { type: Boolean, default: false },
  ats_score:         { type: Number, default: null },
  ats_analysis_json: { type: String, default: null },
  uploaded_at:       { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model("Resume", resumeSchema);
