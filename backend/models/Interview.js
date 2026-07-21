const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  user_id:               { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resume_id:             { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
  title:                 { type: String, default: "General Interview" },
  status:                { type: String, default: "in_progress" },
  overall_score:         { type: Number, default: 0 },
  total_questions:       { type: Number, default: 0 },
  attention_score:       { type: Number, default: 100 },
  look_away_count:       { type: Number, default: 0 },
  recommendations_json:  { type: String, default: null },
  finished_at:           { type: Date, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("Interview", interviewSchema);
