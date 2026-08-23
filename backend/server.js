require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const interviewRoutes = require("./routes/interview");
const settingsRoutes = require("./routes/settings");
const coursesRoutes = require('./routes/courses');

// Connect to MongoDB
connectDB();

const path = require("path");

const app = express();

// Global rate limiter for API endpoints (protects costly LLM credits)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per window
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per window
    message: { error: "Too many login or registration attempts, please try again after 15 minutes." }
});

// CORS origin security configuration
const allowedOrigins = [
    "http://localhost:5600",
    "http://127.0.0.1:5600",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
];
if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",").forEach(url => allowedOrigins.push(url.trim()));
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
            callback(null, true);
        } else {
            callback(new Error("CORS Policy: Access denied from this origin."), false);
        }
    },
    credentials: true
};

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/settings", settingsRoutes);
app.use('/api/courses', coursesRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Voice Interview Backend Running", version: "2.0" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5055;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force exit if server hasn't closed in 10s
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
