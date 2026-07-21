const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/interviewController");
const auth = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/recordings");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname) || ".webm"}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max audio recording
});

// Helper for IDOR ownership check
const checkUserOwnership = (req, res, next) => {
  const targetUserId = req.params.user_id || req.body.user_id;
  if (targetUserId && req.user && req.user.role === 'candidate' && String(req.user.user_id) !== String(targetUserId)) {
    return res.status(403).json({ error: "Access Denied. You can only access your own data." });
  }
  next();
};

// Start a new interview session
router.post("/start", auth, checkUserOwnership, ctrl.startInterview);

// Save an individual answer (accepts multipart/form-data for audio uploads)
router.post("/answer", auth, upload.single("audio"), ctrl.saveAnswer);

// Finish the interview and get results
router.post("/finish", auth, ctrl.finishInterview);

// Get results for a specific interview
router.get("/results/:interview_id", auth, ctrl.getResults);

// Get interview history for a user
router.get("/history/:user_id", auth, checkUserOwnership, ctrl.getHistory);

// Get dashboard stats for a user
router.get("/stats/:user_id", auth, checkUserOwnership, ctrl.getDashboardStats);

// Perform JD to Resume Gap Analysis
router.post("/gap-analysis", auth, ctrl.analyzeGap);

// Generate PDF Report download
const pdfCtrl = require("../controllers/pdfReportController");
router.get("/:id/report", auth, pdfCtrl.generatePdfReport);

module.exports = router;
