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
  avg_wpm:               { type: Number, default: 0 },
  total_filler:          { type: Number, default: 0 },
  mode:                  { type: String, default: 'basic' },       // 'basic' | 'conversation'
  role:                  { type: String, default: null },           // target job role for conversation mode
  persona:               { type: String, default: 'mentor' },      // 'mentor' | 'engineer' | 'stress'
  conversation_json:     { type: String, default: null },          // full conversation history (JSON)
  recommendations_json:  { type: String, default: null },
  finished_at:           { type: Date, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("Interview", interviewSchema);
