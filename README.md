# 🎙️ Intervue.ai — Next-Gen AI Voice Mock Interview System

Intervue.ai is an intelligent, full-stack voice-to-voice mock interview platform powered by Google Gemini AI, Groq LLM fallback, and MongoDB. It simulates real-time conversational technical and behavioral interviews, analyzes speech pacing, tracks gaze attention, parses resumes with multimodal AI, and generates actionable PDF performance reports.

---

## ✨ Features

- 🎯 **AI Voice-to-Voice Mock Interviews**: Real-time adaptive questioning based on candidate resumes, target job descriptions, interviewer personas (Friendly Mentor, Stony Tech Lead, HR Recruiter), and custom focus modes.
- ⚡ **Conversational Intelligence & AI Scoring**: Automatic scoring (1–10) with structured breakdown (Structure, Depth, Delivery), filler word count, WPM calculation, ideal model answers, and follow-up probing.
- 📄 **Multimodal Resume Parsing & ATS Audit**: Instant PDF/Word resume ingestion, automatic extraction of skills/experience/education, and deep ATS compatibility analysis with section grades and suggestions.
- 📚 **AI Courses Hub & Learning Platform**: Structured Career Tracks (Frontend, Backend, System Design, DSA) with progress bars, interactive resource links, and a real-time Gemini AI Study Coach.
- 👁️ **Proctoring Telemetry & Analytics**: Live camera gaze tracking (attention score & look-away counters) and interactive visual dashboards.
- 📄 **PDF Report Generation**: Downloadable performance assessment reports with score breakdown, gaze attention, speech pace, and custom study roadmaps.
- 🔐 **Authentication & OAuth**: Secure JWT authentication, password hashing, and 1-click Google & GitHub OAuth sign-in.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Dark Mode & Glassmorphism design system)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Primary AI Engine**: `@google/generative-ai` (Gemini 2.0 Flash)
- **Fallback AI Engine**: Groq SDK
- **File Processing**: Multer, `pdf-parse`, PDFKit

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Set your variables in `.env`:

```env
PORT=5055
NODE_ENV=development
JWT_SECRET=your_secret_key_at_least_64_characters
MONGODB_URI=mongodb://127.0.0.1:27017/ai_interview_db
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key (optional fallback)
FRONTEND_URL=http://localhost:5600
```

Start the backend server:

```bash
npm run dev   # Runs with nodemon
```

The server will start at `http://localhost:5055`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5600`.

---

## 🐳 Docker Deployment

To run the entire platform locally or on a VPS using Docker:

```bash
# Copy and configure environment
cp backend/.env.example backend/.env

# Launch frontend + backend via Docker Compose
docker compose up -d --build
```

Access the frontend at `http://localhost:80` and backend at `http://localhost:5055`.

---

## 🔐 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend HTTP Port | `5055` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/ai_interview_db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | **Required** |
| `GEMINI_API_KEY` | Google Gemini API Key | **Required** |
| `GROQ_API_KEY` | Groq API Key (AI fallback) | Optional |
| `FRONTEND_URL` | Allowed origin for CORS (comma-separated for multiple) | `http://localhost:5600` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | Optional |

---

## 📝 License

Distributed under the MIT License.
