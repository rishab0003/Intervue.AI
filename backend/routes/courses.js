const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * POST /api/courses/ask
 * Body: { question: string }
 * Returns: { answer: string }
 */
router.post('/ask', auth, async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'A question is required.' });
  }

  if (question.trim().length > 600) {
    return res.status(400).json({ error: 'Question is too long. Maximum 600 characters.' });
  }

  const systemContext = `You are an expert AI interview coach and computer science tutor.
Your job is to give concise, clear, and practical explanations of technical concepts, behavioral frameworks, and interview strategies to help candidates ace their job interviews.

Rules:
- Keep responses to 3-5 sentences maximum. Be dense and direct.
- Always include a real-world example or analogy if it helps.
- If the topic relates to data structures, algorithms, or system design — mention the key metric or complexity.
- If the topic is behavioral (like STAR method) — give a one-sentence example structure.
- Do NOT use markdown headers or bullet lists. Write in plain paragraphs.
- Always end with a one-sentence actionable tip starting with "Tip:".
`;

  const prompt = `${systemContext}\n\nCandidate's question: ${question.trim()}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();
      return res.json({ answer });
    } catch (err) {
      console.error('Gemini courses AI ask error, attempting Groq fallback:', err);
    }
  }

  // Fallback to Groq API
  if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
    try {
      const { callGroqAPI } = require('../utils/groq');
      const answerText = await callGroqAPI(prompt, systemContext, false);
      if (answerText) {
        return res.json({ answer: answerText.trim() });
      }
    } catch (errGroq) {
      console.error('Groq courses AI ask fallback failed:', errGroq);
    }
  }

  res.status(500).json({ error: 'Failed to get an answer from the AI. Please try again.' });
});

module.exports = router;
