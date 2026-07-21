const mongoose = require("mongoose");

const interviewAnswerSchema = new mongoose.Schema({
  interview_id:     { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
  question_index:   { type: Number, required: true },
  question_text:    { type: String, default: null },
  category:         { type: String, default: null },
  answer_text:      { type: String, default: null },
  score:            { type: Number, default: 0 },
  feedback:         { type: String, default: null },
  audio_path:       { type: String, default: null },
  filler_count:     { type: Number, default: 0 },
  wpm:              { type: Number, default: 0 },
  duration_seconds: { type: Number, default: 0 },
  sub_scores_json:  { type: String, default: null },
  model_answer:     { type: String, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

interviewAnswerSchema.index({ interview_id: 1, question_index: 1 }, { unique: true });

module.exports = mongoose.model("InterviewAnswer", interviewAnswerSchema);
