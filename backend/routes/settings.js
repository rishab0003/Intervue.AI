const express = require("express");
const router = express.Router();
const UserSettings = require("../models/UserSettings");
const auth = require("../middleware/auth");

const DEFAULT_SETTINGS = {
  focus_mode: "general",
  focus_skills: [],
  focus_project: "",
  persona: "friendly",
  time_limit: 300,
  question_count: 10,
  blind_mode: false,
  auto_submit: false,
  camera_proctoring: true,
  conversational_mode: true,
  background_noise: "none",
  weights: {
    technical: 4,
    behavioral: 2,
    problem_solving: 2,
    future_goals: 2
  },
  target_role: "",
  job_description: ""
};

// GET /api/settings/:user_id
router.get("/:user_id", auth, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: "user_id parameter is required" });
  }

  if (req.user.role === 'candidate' && String(req.user.user_id) !== String(user_id)) {
    return res.status(403).json({ error: "Access Denied. You can only view your own settings." });
  }

  try {
    const row = await UserSettings.findOne({ user_id });
    if (row && row.settings_json) {
      const parsed = JSON.parse(row.settings_json);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      return res.json(merged);
    }
    
    res.json(DEFAULT_SETTINGS);
  } catch (err) {
    console.error("Fetch settings error:", err);
    res.status(500).json({ message: "Failed to fetch user settings" });
  }
});

// POST /api/settings
router.post("/", auth, async (req, res) => {
  const { user_id, settings } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  if (req.user.role === 'candidate' && String(req.user.user_id) !== String(user_id)) {
    return res.status(403).json({ error: "Access Denied." });
  }

  try {
    const settingsStr = JSON.stringify(settings || DEFAULT_SETTINGS);
    await UserSettings.findOneAndUpdate(
      { user_id },
      { settings_json: settingsStr, updated_at: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ message: "Settings saved successfully", settings });
  } catch (err) {
    console.error("Save settings error:", err);
    res.status(500).json({ message: "Failed to save user settings" });
  }
});

module.exports = router;
