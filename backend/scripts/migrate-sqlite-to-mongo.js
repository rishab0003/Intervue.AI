/**
 * One-time migration script from SQLite (interview.db) to MongoDB.
 * Run with: node backend/scripts/migrate-sqlite-to-mongo.js
 * (Make sure better-sqlite3 is installed temporarily if running this script: npm i better-sqlite3)
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../interview.db");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_interview_db";

const User = require("../models/User");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const InterviewAnswer = require("../models/InterviewAnswer");
const UserSettings = require("../models/UserSettings");

async function migrate() {
  if (!fs.existsSync(DB_PATH)) {
    console.log("No SQLite database found at", DB_PATH, "Skipping migration.");
    process.exit(0);
  }

  let Database;
  try {
    Database = require("better-sqlite3");
  } catch (e) {
    console.error("better-sqlite3 module not found. Run 'npm install better-sqlite3' to execute this migration script.");
    process.exit(1);
  }

  const sqliteDb = new Database(DB_PATH);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for migration.");

  const userIdMap = new Map(); // sqlite user_id -> mongo _id
  const resumeIdMap = new Map(); // sqlite resume_id -> mongo _id
  const interviewIdMap = new Map(); // sqlite interview_id -> mongo _id

  // 1. Users
  const sqliteUsers = sqliteDb.prepare("SELECT * FROM users").all();
  console.log(`Found ${sqliteUsers.length} users in SQLite.`);
  for (const u of sqliteUsers) {
    let mongoUser = await User.findOne({ email: u.email.toLowerCase().trim() });
    if (!mongoUser) {
      mongoUser = await User.create({
        full_name: u.full_name,
        email: u.email.toLowerCase().trim(),
        password_hash: u.password_hash,
        role: u.role || "user",
        graduation_date: u.graduation_date || null,
        target_domain: u.target_domain || null,
        weekly_practice_goal: u.weekly_practice_goal || 3,
        created_at: u.created_at ? new Date(u.created_at) : new Date(),
      });
    }
    userIdMap.set(u.user_id, mongoUser._id);
  }

  // 2. Resumes
  const sqliteResumes = sqliteDb.prepare("SELECT * FROM resumes").all();
  console.log(`Found ${sqliteResumes.length} resumes in SQLite.`);
  for (const r of sqliteResumes) {
    const mongoUserId = userIdMap.get(r.user_id);
    if (!mongoUserId) continue;

    const mongoResume = await Resume.create({
      user_id: mongoUserId,
      resume_text: r.resume_text,
      skills: r.skills,
      experience: r.experience,
      parsed_json: r.parsed_json,
      is_active: Boolean(r.is_active),
      ats_score: r.ats_score,
      ats_analysis_json: r.ats_analysis_json,
      uploaded_at: r.uploaded_at ? new Date(r.uploaded_at) : new Date(),
    });
    resumeIdMap.set(r.resume_id, mongoResume._id);
  }

  // 3. Interviews
  const sqliteInterviews = sqliteDb.prepare("SELECT * FROM interviews").all();
  console.log(`Found ${sqliteInterviews.length} interviews in SQLite.`);
  for (const i of sqliteInterviews) {
    const mongoUserId = userIdMap.get(i.user_id);
    if (!mongoUserId) continue;

    const mongoResumeId = i.resume_id ? resumeIdMap.get(i.resume_id) || null : null;

    const mongoInterview = await Interview.create({
      user_id: mongoUserId,
      resume_id: mongoResumeId,
      title: i.title || "General Interview",
      status: i.status || "in_progress",
      overall_score: i.overall_score || 0,
      total_questions: i.total_questions || 0,
      attention_score: i.attention_score || 100,
      look_away_count: i.look_away_count || 0,
      recommendations_json: i.recommendations_json || null,
      created_at: i.created_at ? new Date(i.created_at) : new Date(),
      finished_at: i.finished_at ? new Date(i.finished_at) : null,
    });
    interviewIdMap.set(i.interview_id, mongoInterview._id);
  }

  // 4. Interview Answers
  const sqliteAnswers = sqliteDb.prepare("SELECT * FROM interview_answers").all();
  console.log(`Found ${sqliteAnswers.length} answers in SQLite.`);
  for (const a of sqliteAnswers) {
    const mongoInterviewId = interviewIdMap.get(a.interview_id);
    if (!mongoInterviewId) continue;

    await InterviewAnswer.create({
      interview_id: mongoInterviewId,
      question_index: a.question_index,
      question_text: a.question_text,
      category: a.category,
      answer_text: a.answer_text,
      score: a.score || 0,
      feedback: a.feedback,
      audio_path: a.audio_path,
      filler_count: a.filler_count || 0,
      wpm: a.wpm || 0,
      duration_seconds: a.duration_seconds || 0,
      sub_scores_json: a.sub_scores_json,
      model_answer: a.model_answer,
      created_at: a.created_at ? new Date(a.created_at) : new Date(),
    });
  }

  // 5. User Settings
  const sqliteSettings = sqliteDb.prepare("SELECT * FROM user_settings").all();
  console.log(`Found ${sqliteSettings.length} user settings in SQLite.`);
  for (const s of sqliteSettings) {
    const mongoUserId = userIdMap.get(s.user_id);
    if (!mongoUserId) continue;

    await UserSettings.findOneAndUpdate(
      { user_id: mongoUserId },
      { settings_json: s.settings_json, updated_at: s.updated_at ? new Date(s.updated_at) : new Date() },
      { upsert: true }
    );
  }

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
