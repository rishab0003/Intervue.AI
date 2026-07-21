const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  updateProfile
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update-profile", authMiddleware, updateProfile);

// OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

module.exports = router;
