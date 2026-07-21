const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const InterviewAnswer = require("../models/InterviewAnswer");
const Resume = require("../models/Resume");
const UserSettings = require("../models/UserSettings");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const STUDY_RESOURCES = {
  "Technical": {
    topic: "Core Technical Concepts & Algorithms",
    links: [
      { name: "roadmap.sh — Computer Science", url: "https://roadmap.sh/computer-science", icon: "🌐" },
      { name: "freeCodeCamp — Computer Science Course", url: "https://www.youtube.com/results?search_query=freecodecamp+computer+science", icon: "📺" },
      { name: "GeeksforGeeks — Technical Interview Prep", url: "https://www.geeksforgeeks.org/complete-interview-preparation-course/", icon: "📚" }
    ]
  },
  "Problem Solving": {
    topic: "Algorithms & Problem Solving",
    links: [
      { name: "LeetCode — Practice Coding Problems", url: "https://leetcode.com/", icon: "💻" },
      { name: "NeetCode — Structured Coding Path & Solutions", url: "https://neetcode.io/practice", icon: "📺" },
      { name: "roadmap.sh — Software Design & Architecture", url: "https://roadmap.sh/software-design-architecture", icon: "📐" }
    ]
  },
  "Behavioral": {
    topic: "STAR Method & Behavioral Questions",
    links: [
      { name: "STAR Method Guide — Interview Prep", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-method-for-interview-questions", icon: "🤝" },
      { name: "YouTube — How to answer behavioral questions", url: "https://www.youtube.com/results?search_query=how+to+answer+behavioral+interview+questions+star+method", icon: "📺" }
    ]
  },
  "Communication": {
    topic: "Clear Communication & STAR Structuring",
    links: [
      { name: "Indeed Guide — Active Listening & Communication", url: "https://www.indeed.com/career-advice/career-development/communication-skills-for-interviews", icon: "💬" }
    ]
  },
  "Future Goals": {
    topic: "Career Roadmapping & Alignment",
    links: [
      { name: "roadmap.sh — Developer Roadmaps", url: "https://roadmap.sh", icon: "🚀" }
    ]
  }
};

function getCustomResourceRecommendations(answers) {
  const recommendations = [];
  const addedCategories = new Set();
  const addedKeywords = new Set();

  answers.forEach(a => {
    if (a.score < 6.0) {
      if (STUDY_RESOURCES[a.category] && !addedCategories.has(a.category)) {
        addedCategories.add(a.category);
        recommendations.push(STUDY_RESOURCES[a.category]);
      }

      const textToScan = `${a.question_text || ""} ${a.answer_text || ""}`.toLowerCase();
      
      if ((textToScan.includes("sql") || textToScan.includes("database") || textToScan.includes("query") || textToScan.includes("postgres") || textToScan.includes("mysql")) && !addedKeywords.has("sql")) {
        addedKeywords.add("sql");
        recommendations.push({
          topic: "SQL & Relational Databases",
          links: [
            { name: "SQLZoo — Interactive SQL Tutorial", url: "https://sqlzoo.net/", icon: "🧩" },
            { name: "roadmap.sh — PostgreSQL roadmap", url: "https://roadmap.sh/postgresql", icon: "🌐" },
            { name: "freeCodeCamp — Complete SQL Database Course (Video)", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", icon: "📺" }
          ]
        });
      }

      if ((textToScan.includes("docker") || textToScan.includes("kubernetes") || textToScan.includes("devops") || textToScan.includes("cicd") || textToScan.includes("container")) && !addedKeywords.has("docker")) {
        addedKeywords.add("docker");
        recommendations.push({
          topic: "Docker & DevOps Containers",
          links: [
            { name: "roadmap.sh — Docker / Container Guide", url: "https://roadmap.sh/docker", icon: "🌐" },
            { name: "freeCodeCamp — Docker for Beginners (Video)", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", icon: "📺" }
          ]
        });
      }

      if ((textToScan.includes("react") || textToScan.includes("frontend") || textToScan.includes("css") || textToScan.includes("html") || textToScan.includes("dom")) && !addedKeywords.has("react")) {
        addedKeywords.add("react");
        recommendations.push({
          topic: "React & Modern Frontend Development",
          links: [
            { name: "roadmap.sh — Frontend Developer Roadmap", url: "https://roadmap.sh/frontend", icon: "🌐" },
            { name: "React — Official Documentation & Guides", url: "https://react.dev/reference/react", icon: "⚛️" },
            { name: "freeCodeCamp — Full React Course (Video)", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", icon: "📺" }
          ]
        });
      }

      if ((textToScan.includes("node") || textToScan.includes("backend") || textToScan.includes("api") || textToScan.includes("express") || textToScan.includes("fastapi")) && !addedKeywords.has("node")) {
        addedKeywords.add("node");
        recommendations.push({
          topic: "Node.js & Backend REST APIs",
          links: [
            { name: "roadmap.sh — Backend Developer Roadmap", url: "https://roadmap.sh/backend", icon: "🌐" },
            { name: "freeCodeCamp — Node.js & Express.js Course (Video)", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", icon: "📺" }
          ]
        });
      }

      if ((textToScan.includes("git") || textToScan.includes("github") || textToScan.includes("version control")) && !addedKeywords.has("git")) {
        addedKeywords.add("git");
        recommendations.push({
          topic: "Git & Version Control Collaboration",
          links: [
            { name: "roadmap.sh — Git Guide", url: "https://roadmap.sh/git", icon: "🌐" },
            { name: "Git Flight Rules — Git Tricks FAQ Guide", url: "https://github.com/k88hudson/git-flight-rules", icon: "✈️" }
          ]
        });
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      topic: "System Design & Architecture (Advanced)",
      links: [
        { name: "roadmap.sh — Software Design & Architecture", url: "https://roadmap.sh/software-design-architecture", icon: "📐" },
        { name: "ByteByteGo — System Design Primer (Video)", url: "https://www.youtube.com/results?search_query=bytebytego+system+design", icon: "📺" },
        { name: "System Design Primer Guide (GitHub)", url: "https://github.com/donnemartin/system-design-primer", icon: "📚" }
      ]
    });
  }

  return recommendations;
}

/**
 * Score an answer based on Gemini AI or fallback heuristics.
 */
async function scoreAnswer(questionText, answerText, category) {
  if (!answerText || answerText.trim().length < 10) {
    return {
      score: 0,
      feedback: "No answer provided or the answer was too brief.",
      model_answer: "An ideal response would introduce the concept, explain key implementation metrics, and provide a concrete example.",
      sub_scores: {
        structure: { score: 0, reason: "Answer too short." },
        content_depth: { score: 0, reason: "Answer too short." },
        clarity_delivery: { score: 0, reason: "Answer too short." }
      }
    };
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Assess this job interview candidate's answer to the question.
Question: ${questionText}
Category: ${category}
Candidate Answer: ${answerText}

Evaluate the response for completeness, structure, correctness, and depth. Provide a score between 1.0 and 10.0 (one decimal place). Also provide constructive, actionable feedback in 2-3 sentences.
Additionally, write a brief, high-scoring model/ideal answer (60-80 words) that demonstrates how a top-tier candidate would answer this question, showcasing correct technical terminology or structure (like the STAR method for behavioral categories).

Return ONLY a valid JSON object with the following fields:
- "score": (number, e.g. 7.5)
- "feedback": (string, 2-3 sentences of feedback)
- "model_answer": (string, the high-scoring model answer)
- "sub_scores": (object with 3 keys: "structure", "content_depth", "clarity_delivery". Each key must be an object with "score" (number out of 10) and "reason" (short string)).

Do not include any markdown formatting like \`\`\`json or \`\`\`.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const evaluation = JSON.parse(cleanJson);
      if (evaluation && typeof evaluation.score === "number" && evaluation.feedback && evaluation.sub_scores) {
        return {
          score: Math.min(10, Math.max(1, Math.round(evaluation.score * 10) / 10)),
          feedback: evaluation.feedback,
          sub_scores: evaluation.sub_scores,
          model_answer: evaluation.model_answer || "A good response should cover the core concepts, structure, and provide relevant metrics or examples."
        };
      }
    } catch (e) {
      console.error("Gemini scoring error, attempting Groq fallback:", e);
      if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
        try {
          const { callGroqAPI } = require("../utils/groq");
          console.log("Routing answer scoring to Groq fallback...");
          const groqPrompt = `Assess this job interview candidate's answer to the question.
Question: ${questionText}
Category: ${category}
Candidate Answer: ${answerText}

Evaluate the response for completeness, structure, correctness, and depth. Provide a score between 1.0 and 10.0 (one decimal place). Also provide constructive, actionable feedback in 2-3 sentences.
Additionally, write a brief, high-scoring model/ideal answer (60-80 words) that demonstrates how a top-tier candidate would answer this question.

Return ONLY a valid JSON object with the following fields:
- "score": (number, e.g. 7.5)
- "feedback": (string, 2-3 sentences of feedback)
- "model_answer": (string, the high-scoring model answer)
- "sub_scores": (object with 3 keys: "structure", "content_depth", "clarity_delivery". Each key must be an object with "score" (number out of 10) and "reason" (short string)).`;

          const responseText = await callGroqAPI(groqPrompt, "You are a professional mock interview evaluator assessing candidate answers in valid JSON format.", true);
          const evaluation = JSON.parse(responseText);
          if (evaluation && typeof evaluation.score === "number" && evaluation.feedback && evaluation.sub_scores) {
            return {
              score: Math.min(10, Math.max(1, Math.round(evaluation.score * 10) / 10)),
              feedback: evaluation.feedback,
              sub_scores: evaluation.sub_scores,
              model_answer: evaluation.model_answer || "A good response should cover the core concepts, structure, and provide relevant metrics or examples."
            };
          }
        } catch (errGroq) {
          console.error("Groq scoring fallback also failed:", errGroq);
        }
      }
    }
  }

  return scoreAnswerFallback(questionText, answerText, category);
}

/**
 * Fallback scoring algorithm (rule-based)
 */
function scoreAnswerFallback(questionText, answerText, category) {
  const words = answerText.trim().split(/\s+/).length;
  const answer = answerText.toLowerCase();

  let score = 0;
  if (words >= 20) score += 2;
  if (words >= 50) score += 1;
  if (words >= 100) score += 1;
  if (words >= 150) score += 1;

  const keywordSets = {
    "Technical": ["implementation", "system", "architecture", "algorithm", "database", "api", "code", "framework", "performance", "scalable", "design", "testing", "debug", "deploy"],
    "Behavioral": ["situation", "task", "action", "result", "team", "communication", "challenge", "learned", "responsibility", "outcome", "collaborated", "resolved", "achieved"],
    "Problem Solving": ["approach", "identify", "analyze", "solution", "steps", "tested", "iterated", "root cause", "fixed", "optimized", "alternative", "decided"],
    "Leadership": ["led", "managed", "guided", "motivated", "delegated", "vision", "strategy", "aligned", "mentored", "coordinated", "stakeholder", "decision"],
    "Communication": ["explained", "presented", "simplified", "feedback", "listened", "adapted", "clarity", "documented", "audience", "meeting", "conveyed"],
    "Future Goals": ["goal", "aspire", "growth", "improve", "career", "contribute", "develop", "achieve", "plan", "learn", "opportunity", "long-term"],
    "default": ["experience", "skill", "example", "situation", "result", "approach", "team", "project", "challenge", "solution"]
  };

  const keywords = keywordSets[category] || keywordSets["default"];
  let keywordHits = 0;
  keywords.forEach(kw => { if (answer.includes(kw)) keywordHits++; });

  score += Math.min(4, Math.round((keywordHits / keywords.length) * 4 * 2));

  if (answer.includes("situation") || answer.includes("when i") || answer.includes("for example")) score += 0.5;
  if (answer.includes("result") || answer.includes("outcome") || answer.includes("as a result")) score += 0.5;

  score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

  let feedback = "";
  if (score >= 8.5) {
    feedback = `Excellent answer! You demonstrated strong ${category.toLowerCase()} skills with clear, structured thinking and relevant examples.`;
  } else if (score >= 7) {
    feedback = `Good answer. You covered the key points well. Consider adding more specific examples or metrics to strengthen your response further.`;
  } else if (score >= 5) {
    feedback = `Decent answer but could be more detailed. Try using the STAR method (Situation, Task, Action, Result) for more impact.`;
  } else {
    feedback = `Your answer needs improvement. Try to be more specific, use concrete examples, and structure your response more clearly.`;
  }

  const sub_scores = {
    structure: { score: Math.round(score * 0.9), reason: "Estimated based on answer length." },
    content_depth: { score: Math.round(score * 1.1), reason: "Estimated based on keywords." },
    clarity_delivery: { score: score, reason: "Default baseline." }
  };

  return {
    score,
    feedback,
    sub_scores,
    model_answer: "An ideal response should define key terms (e.g. rate limiting or indexing), explain the architecture details, and supply a concrete scenario with metrics."
  };
}

/**
 * Generate interview questions from resume text and structured JSON data using Gemini.
 */
async function generateQuestionsFromResume(resumeText, skills, parsedJson, userSettings, excludedQuestions = []) {
  let context = "";
  if (parsedJson) {
    context = `Structured Candidate Resume Info (JSON): ${parsedJson}`;
  } else {
    context = `Resume Text: ${resumeText || "No resume text"}\nSkills: ${skills || "No skills extracted"}`;
  }

  const w = userSettings?.weights || { technical: 4, behavioral: 2, problem_solving: 2, future_goals: 2 };
  const totalW = (Number(w.technical) || 0) + (Number(w.behavioral) || 0) + (Number(w.problem_solving) || 0) + (Number(w.future_goals) || 0) || 10;
  
  const targetCount = Number(userSettings?.question_count) || 10;
  const techCount = Math.round(((Number(w.technical) || 0) / totalW) * targetCount) || Math.ceil(targetCount * 0.4);
  const behCount = Math.round(((Number(w.behavioral) || 0) / totalW) * targetCount) || Math.ceil(targetCount * 0.2);
  const probCount = Math.round(((Number(w.problem_solving) || 0) / totalW) * targetCount) || Math.ceil(targetCount * 0.2);
  const futCount = Math.max(0, targetCount - (techCount + behCount + probCount));

  let focusInstruction = "";
  if (userSettings?.focus_mode === "skills" && Array.isArray(userSettings.focus_skills) && userSettings.focus_skills.length > 0) {
    focusInstruction = `Focus the technical questions specifically on the following skills: ${userSettings.focus_skills.join(", ")}.`;
  } else if (userSettings?.focus_mode === "project" && userSettings.focus_project) {
    focusInstruction = `This is a project deep-dive interview. Focus the technical and problem-solving questions heavily on the architectural design, trade-offs, scalability bottlenecks, databases, and implementation details of the candidate's project named: "${userSettings.focus_project}".`;
  }

  let personaInstruction = "Your persona: Friendly Mentor. Be supportive, warm, and encourage structured answers.";
  if (userSettings?.persona === "stony") {
    personaInstruction = "Your persona: Stony Tech Lead. Ask rigorous, challenging, and detailed questions. Probe for technical logic, design compromises, performance optimization, and edge cases. Keep the tone dry and formal.";
  } else if (userSettings?.persona === "recruiter") {
    personaInstruction = "Your persona: HR Recruiter. Focus heavily on behavioral scenarios, collaboration, team alignment, soft skills, and cultural fit.";
  }

  let jdInstruction = "";
  if (userSettings?.target_role || userSettings?.job_description) {
    jdInstruction = `The candidate is applying for the role: "${userSettings.target_role || "Software Developer"}".`;
    if (userSettings.job_description) {
      jdInstruction += ` Here is the target Job Description: "${userSettings.job_description}". Align all questions specifically to evaluate suitability for this role and JD.`;
    }
  }

  let exclusionInstruction = "";
  if (Array.isArray(excludedQuestions) && excludedQuestions.length > 0) {
    exclusionInstruction = `Exclusion Rules:
Do NOT generate any of the following questions (or highly similar variants of them):
${excludedQuestions.map((q, i) => `${i + 1}. "${q}"`).join("\n")}
Ensure you cover completely different skills, projects, scenarios, or discussion points.`;
  }

  const prompt = `Analyze the following resume data. Generate exactly ${targetCount} personalized, professional, and targeted mock job interview questions.
The questions must cover this category count layout:
- Technical: ${techCount} questions (Focus on technical skills, tools, and paradigms)
- Behavioral: ${behCount} questions (Focus on past situations, collaboration, and STAR method responses)
- Problem Solving: ${probCount} questions (Focus on debugging, troubleshooting, tradeoffs, and analysis)
- Future Goals/Communication: ${futCount} questions (Focus on aspirations, clarity, and explaining architectures)

Rules:
- Return ONLY a valid JSON array of objects. Each object must have exactly "category" and "text" fields. Do not include any markdown formatting like \`\`\`json or \`\`\`.
- Category names in objects must strictly match: "Technical", "Behavioral", "Problem Solving", or "Communication/Goals".
- Generate a completely unique, fresh, and different set of questions. Random seed/timestamp: ${Date.now()}.

Interviewer Setup instructions:
${personaInstruction}
${focusInstruction}
${jdInstruction}

${exclusionInstruction}

Resume context:
${context}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85 }
      });
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const questions = JSON.parse(cleanJson);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions.slice(0, targetCount);
      }
    } catch (e) {
      console.error("Gemini question generation error, attempting Groq fallback:", e);
      if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
        try {
          const { callGroqAPI } = require("../utils/groq");
          console.log("Routing question generation to Groq fallback...");
          const responseText = await callGroqAPI(
            prompt,
            "You are a professional mock interviewer generating questions in valid JSON array format.",
            true,
            null,
            null,
            0.85
          );
          const questions = JSON.parse(responseText);
          if (Array.isArray(questions) && questions.length > 0) {
            return questions.slice(0, targetCount);
          }
        } catch (errGroq) {
          console.error("Groq question generation fallback also failed:", errGroq);
        }
      }
    }
  }

  return generateQuestionsFromResumeFallback(resumeText, skills, targetCount);
}

function generateQuestionsFromResumeFallback(resumeText, skills, targetCount = 10) {
  const text = (resumeText || "").toLowerCase();
  const skillList = (skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const pool = [];

  skillList.forEach(skill => {
    pool.push({
      category: "Technical",
      text: `Can you walk me through a major project where you utilized ${skill}? What technical compromises did you have to make?`
    });
    pool.push({
      category: "Technical",
      text: `What are the typical pitfalls or performance gotchas when using ${skill} at scale, and how do you prevent them?`
    });
  });

  if (text.includes("lead") || text.includes("managed") || text.includes("senior")) {
    pool.push({
      category: "Behavioral",
      text: "Describe a situation where you had to lead a project under tight constraints. How did you organize the tasks and verify delivery?"
    });
    pool.push({
      category: "Behavioral",
      text: "Tell me about a time you mentored a junior engineer or resolved a technical disagreement within your team."
    });
  }

  if (text.includes("agile") || text.includes("scrum") || text.includes("sprint")) {
    pool.push({
      category: "Technical",
      text: "How do you handle estimation differences or sprint scope creep during agile development cycles?"
    });
  }

  const universal = [
    { category: "Behavioral", text: "Tell me about a time you made a major mistake on a production release. How did you react and resolve it?" },
    { category: "Problem Solving", text: "Walk me through your preferred process for troubleshooting a memory leak or a sudden spike in latency." },
    { category: "Communication/Goals", text: "How do you translate complicated architectural decisions into clear action items for non-technical stakeholders?" },
    { category: "Behavioral", text: "Describe a project where you had to work with a technology you had never used before. How did you get up to speed?" },
    { category: "Technical", text: "What is your preference between REST and GraphQL for building scalable APIs, and why?" },
    { category: "Communication/Goals", text: "Where do you see yourself technically in three years? What specific architectural patterns are you eager to master?" },
    { category: "Behavioral", text: "Tell me about a time you disagreed with a product decision. How did you communicate your concerns?" },
    { category: "Problem Solving", text: "How do you decide when to refactor existing legacy code versus writing a fresh implementation?" },
    { category: "Technical", text: "Explain your experience with microservices. What are the operational challenges of distributed systems?" },
    { category: "Behavioral", text: "Describe a situation where you worked under a tight, stressful deadline. How did you manage your prioritization?" },
    { category: "Problem Solving", text: "Walk me through how you evaluate the security practices of a third-party dependency or API you plan to import." }
  ];

  universal.forEach(q => pool.push(q));

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, targetCount);
}

/**
 * START INTERVIEW SESSION
 */
exports.startInterview = async (req, res) => {
  const { user_id, resume_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    let resumeText = "";
    let skills = "";
    let parsedJson = "";
    let title = "General Interview";

    if (resume_id) {
      const resume = await Resume.findOne({ _id: resume_id, user_id });
      if (resume) {
        resumeText = resume.resume_text || "";
        skills = resume.skills || "";
        parsedJson = resume.parsed_json || "";
      }
    } else {
      const resume = await Resume.findOne({ user_id }).sort({ uploaded_at: -1 });
      if (resume) {
        resumeText = resume.resume_text || "";
        skills = resume.skills || "";
        parsedJson = resume.parsed_json || "";
        title = `Interview — ${new Date().toLocaleDateString()}`;
      }
    }

    let userSettings = null;
    try {
      const row = await UserSettings.findOne({ user_id });
      if (row && row.settings_json) {
        userSettings = JSON.parse(row.settings_json);
      }
    } catch (e) {
      console.warn("Failed to load user settings:", e);
    }

    let excludedQuestions = [];
    try {
      const pastInterviews = await Interview.find({ user_id }).select("_id");
      const pastInterviewIds = pastInterviews.map(i => i._id);
      const pastAnswers = await InterviewAnswer.find({ interview_id: { $in: pastInterviewIds } })
        .sort({ created_at: -1 })
        .limit(15)
        .select("question_text");
      excludedQuestions = [...new Set(pastAnswers.map(r => r.question_text).filter(Boolean))];
    } catch (e) {
      console.warn("Failed to load past questions for exclusion:", e);
    }

    const questions = await generateQuestionsFromResume(resumeText, skills, parsedJson, userSettings, excludedQuestions);
    const interview = await Interview.create({
      user_id,
      resume_id: resume_id || null,
      title,
      total_questions: questions.length
    });

    res.json({
      interview_id: interview._id,
      questions,
      title
    });
  } catch (err) {
    console.error("Start interview error:", err);
    res.status(500).json({ message: "Failed to start interview session" });
  }
};

/**
 * SAVE ANSWER
 */
exports.saveAnswer = async (req, res) => {
  const { interview_id, question_index, question_text, category, answer_text, duration_seconds } = req.body;

  if (!interview_id || question_index === undefined) {
    return res.status(400).json({ message: "interview_id and question_index are required" });
  }

  try {
    const { score, feedback, sub_scores, model_answer } = await scoreAnswer(question_text, answer_text, category);
    const sub_scores_json = sub_scores ? JSON.stringify(sub_scores) : null;

    const audio_path = req.file ? `/uploads/recordings/${req.file.filename}` : null;

    const cleanText = (answer_text || "").toLowerCase();
    const fillerWords = ["um", "uh", "like", "actually", "you know"];
    let fillerCount = 0;
    
    fillerWords.forEach(word => {
      if (word === "you know") {
        const matches = cleanText.match(/you know/g);
        if (matches) fillerCount += matches.length;
      } else {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = cleanText.match(regex);
        if (matches) fillerCount += matches.length;
      }
    });

    const wordCount = (answer_text || "").trim().split(/\s+/).filter(Boolean).length;
    const duration = parseInt(duration_seconds) || 0;
    let wpm = 0;
    if (duration > 0 && wordCount > 0) {
      wpm = Math.round((wordCount / duration) * 60);
    }

    const updateFields = {
      question_text,
      category,
      answer_text,
      score,
      feedback,
      filler_count: fillerCount,
      wpm,
      duration_seconds: duration,
      sub_scores_json,
      model_answer
    };
    if (audio_path) {
      updateFields.audio_path = audio_path;
    }

    await InterviewAnswer.findOneAndUpdate(
      { interview_id, question_index },
      updateFields,
      { upsert: true, returnDocument: 'after' }
    );

    let userSettings = null;
    try {
      const currentInterview = await Interview.findById(interview_id);
      if (currentInterview) {
        const row = await UserSettings.findOne({ user_id: currentInterview.user_id });
        if (row && row.settings_json) {
          userSettings = JSON.parse(row.settings_json);
        }
      }
    } catch (e) {
      console.warn("Failed to load user settings in saveAnswer:", e);
    }

    let followUpQuestion = null;
    if (userSettings?.conversational_mode !== false && category !== "Follow-up" && score < 8.0) {
      const followUpPrompt = `You are a professional mock job interviewer.
The candidate was asked the following question:
"${question_text}"

And they provided this answer:
"${answer_text}"

Based on their answer (which scored a mediocre ${score}/10), ask exactly one brief, direct conversational follow-up question (maximum 25 words) to probe deeper, clarify their point, or ask them to elaborate on a specific detail they mentioned. Do not say "Based on your answer" or anything similar, just ask the question directly as if speaking to them.`;

      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent(followUpPrompt);
          const followUpText = result.response.text().trim();
          if (followUpText) {
            followUpQuestion = {
              category: "Follow-up",
              text: followUpText
            };
          }
        } catch (e) {
          console.error("Gemini follow-up generation error, trying Groq:", e);
          if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
            try {
              const { callGroqAPI } = require("../utils/groq");
              const followUpText = await callGroqAPI(followUpPrompt, "You are a professional mock interviewer asking a follow-up question.", false);
              if (followUpText) {
                followUpQuestion = {
                  category: "Follow-up",
                  text: followUpText.trim()
                };
              }
            } catch (errGroq) {
              console.error("Groq follow-up generation failed:", errGroq);
            }
          }
        }
      }
    }

    res.json({ score, feedback, sub_scores, filler_count: fillerCount, wpm, message: "Answer saved", follow_up: followUpQuestion });
  } catch (err) {
    console.error("Save answer error:", err);
    res.status(500).json({ message: "Failed to save answer" });
  }
};

/**
 * FINISH INTERVIEW & CALCULATE RESULTS
 */
exports.finishInterview = async (req, res) => {
  const { interview_id, attention_score, look_away_count } = req.body;

  if (!interview_id) {
    return res.status(400).json({ message: "interview_id is required" });
  }

  try {
    const answers = await InterviewAnswer.find({ interview_id }).sort({ question_index: 1 });

    const totalAnswers = answers.length;
    const avgScore = totalAnswers > 0
      ? answers.reduce((sum, a) => sum + (a.score || 0), 0) / totalAnswers
      : 0;

    const overallScore = Math.round(avgScore * 10) / 10;

    const categoryScores = {};
    answers.forEach(a => {
      if (!categoryScores[a.category]) categoryScores[a.category] = { total: 0, count: 0 };
      categoryScores[a.category].total += a.score;
      categoryScores[a.category].count++;
    });

    const breakdown = Object.entries(categoryScores).map(([cat, data]) => ({
      category: cat,
      score: Math.round((data.total / data.count) * 10) / 10
    }));

    const recommendations = getCustomResourceRecommendations(answers);
    const recommendationsJson = JSON.stringify(recommendations);

    const updateObj = {
      status: 'completed',
      overall_score: overallScore,
      recommendations_json: recommendationsJson,
      finished_at: new Date()
    };
    if (attention_score !== undefined && attention_score !== null) updateObj.attention_score = attention_score;
    if (look_away_count !== undefined && look_away_count !== null) updateObj.look_away_count = look_away_count;

    await Interview.findByIdAndUpdate(interview_id, updateObj);

    res.json({
      interview_id,
      overall_score: overallScore,
      total_answers: totalAnswers,
      breakdown,
      recommendations,
      answers: answers.map(a => ({
        question_index: a.question_index,
        question_text: a.question_text,
        category: a.category,
        answer_text: a.answer_text,
        score: a.score,
        feedback: a.feedback,
        audio_path: a.audio_path,
        filler_count: a.filler_count,
        wpm: a.wpm,
        duration_seconds: a.duration_seconds
      }))
    });
  } catch (err) {
    console.error("Finish interview error:", err);
    res.status(500).json({ message: "Failed to finish interview" });
  }
};

/**
 * GET INTERVIEW RESULTS
 */
exports.getResults = async (req, res) => {
  const { interview_id } = req.params;

  try {
    const interview = await Interview.findById(interview_id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const answers = await InterviewAnswer.find({ interview_id }).sort({ question_index: 1 });

    let recommendations = [];
    if (interview.recommendations_json) {
      try {
        recommendations = JSON.parse(interview.recommendations_json);
      } catch (e) {}
    }

    res.json({ interview, answers, recommendations });
  } catch (err) {
    console.error("Get results error:", err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

/**
 * GET INTERVIEW HISTORY FOR A USER
 */
exports.getHistory = async (req, res) => {
  const { user_id } = req.params;

  try {
    const interviews = await Interview.find({ user_id, status: 'completed' }).sort({ created_at: -1 }).limit(20);

    const result = await Promise.all(interviews.map(async (i) => {
      const count = await InterviewAnswer.countDocuments({ interview_id: i._id });
      const obj = i.toObject();
      obj.interview_id = obj._id;
      obj.answered_questions = count;
      return obj;
    }));

    res.json({ interviews: result });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
};

/**
 * GET DASHBOARD STATS FOR A USER
 */
exports.getDashboardStats = async (req, res) => {
  const { user_id } = req.params;
  const { period = '30', start, end } = req.query;

  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(user_id) ? new mongoose.Types.ObjectId(user_id) : user_id;
    const filter = { user_id: userObjectId, status: 'completed' };

    const now = new Date();
    if (period === '7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      filter.created_at = { $gte: d };
    } else if (period === '30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      filter.created_at = { $gte: d };
    } else if (period === '90') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      filter.created_at = { $gte: d };
    } else if (period === 'custom' && start && end) {
      filter.created_at = { $gte: new Date(`${start}T00:00:00`), $lte: new Date(`${end}T23:59:59`) };
    }

    const totalInterviewsCount = await Interview.countDocuments(filter);

    const avgScoreAgg = await Interview.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: "$overall_score" } } }
    ]);
    const avgScoreVal = avgScoreAgg.length > 0 ? avgScoreAgg[0].avg : 0;

    const recentInterviewsDocs = await Interview.find(filter)
      .sort({ created_at: -1 })
      .limit(5)
      .select("_id title overall_score total_questions created_at");

    const recentInterviews = recentInterviewsDocs.map(d => ({
      interview_id: d._id,
      title: d.title,
      overall_score: d.overall_score,
      total_questions: d.total_questions,
      created_at: d.created_at
    }));

    const firstInterview = await Interview.findOne(filter).sort({ created_at: 1 }).select("overall_score");
    const lastInterview = await Interview.findOne(filter).sort({ created_at: -1 }).select("overall_score");

    let improvement = 0;
    if (firstInterview && lastInterview && firstInterview.overall_score > 0) {
      improvement = Math.round(((lastInterview.overall_score - firstInterview.overall_score) / firstInterview.overall_score) * 100);
    }

    // Dynamic prep stats (speech/gaze metrics)
    const completedInterviewIds = (await Interview.find(filter).select("_id")).map(i => i._id);

    const wpmAgg = await InterviewAnswer.aggregate([
      { $match: { interview_id: { $in: completedInterviewIds } } },
      { $group: { _id: null, avg: { $avg: "$wpm" }, totalFiller: { $sum: "$filler_count" } } }
    ]);
    const avgWpmVal = wpmAgg.length > 0 ? wpmAgg[0].avg : 0;
    const totalFillerVal = wpmAgg.length > 0 ? wpmAgg[0].totalFiller : 0;

    const attentionAgg = await Interview.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: "$attention_score" } } }
    ]);
    const avgAttentionVal = attentionAgg.length > 0 ? attentionAgg[0].avg : 100;

    const latestInterviewDoc = await Interview.findOne({ ...filter, recommendations_json: { $ne: null } })
      .sort({ created_at: -1 })
      .select("recommendations_json");

    let latestRecommendations = [];
    if (latestInterviewDoc && latestInterviewDoc.recommendations_json) {
      try {
        latestRecommendations = JSON.parse(latestInterviewDoc.recommendations_json);
      } catch (e) {}
    }

    const settingsRow = await UserSettings.findOne({ user_id });
    let userSettings = null;
    if (settingsRow && settingsRow.settings_json) {
      try {
        userSettings = JSON.parse(settingsRow.settings_json);
      } catch (e) {}
    }

    // Practice Streak & Last 7 Days Activity
    let streak = 0;
    let activitySparkline = [0, 0, 0, 0, 0, 0, 0];
    try {
      const allCompleted = await Interview.find({ user_id, status: 'completed' }).select("created_at");
      const dateSet = new Set(allCompleted.map(i => {
        const d = new Date(i.created_at);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }));

      if (dateSet.size > 0) {
        const today = new Date();
        const formatDate = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const todayStr = formatDate(today);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        let hasPracticedRecent = false;
        let startCheckDate = null;

        if (dateSet.has(todayStr)) {
          hasPracticedRecent = true;
          startCheckDate = today;
        } else if (dateSet.has(yesterdayStr)) {
          hasPracticedRecent = true;
          startCheckDate = yesterday;
        }

        if (hasPracticedRecent) {
          streak = 1;
          const currentCheck = new Date(startCheckDate);
          while (true) {
            currentCheck.setDate(currentCheck.getDate() - 1);
            const checkStr = formatDate(currentCheck);
            if (dateSet.has(checkStr)) {
              streak++;
            } else {
              break;
            }
          }
        }

        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dStr = formatDate(d);
          activitySparkline[i] = dateSet.has(dStr) ? 1 : 0;
        }
      }
    } catch (e) {
      console.warn("Failed to calculate practice streak:", e);
    }

    res.json({
      totalInterviews: totalInterviewsCount || 0,
      averageScore: Math.round((avgScoreVal || 0) * 10) / 10,
      improvement,
      recentInterviews,
      weeklyProgress: [],
      avgWpm: Math.round(avgWpmVal || 0),
      avgAttention: Math.round(avgAttentionVal || 100),
      totalFiller: totalFillerVal || 0,
      latestRecommendations,
      userSettings,
      streak,
      activitySparkline
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

/**
 * PERFORM JD TO RESUME GAP ANALYSIS
 */
exports.analyzeGap = async (req, res) => {
  const { resume_id, job_description, user_id } = req.body;

  if (!resume_id || !job_description || !user_id) {
    return res.status(400).json({ message: "resume_id, job_description, and user_id are required" });
  }

  try {
    const resume = await Resume.findOne({ _id: resume_id, user_id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeText = resume.resume_text || "";
    
    if (!genAI) {
      return res.status(503).json({ message: "AI services are not configured." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are an expert technical recruiter and resume reviewer.
Perform a strict Gap Analysis between the provided Job Description and the Candidate's Resume.

Job Description:
"""
${job_description}
"""

Candidate Resume:
"""
${resumeText}
"""

Evaluate how well the candidate fits the role. Identify missing skills, core strengths, and provide actionable recommendations.
Return ONLY a valid JSON object with exactly these fields (no markdown, no backticks):
- "match_score": (number from 0 to 100)
- "missing_skills": (array of 3-6 strings, highlighting specific technologies or requirements from the JD not found in the resume)
- "key_strengths": (array of 3-5 strings, highlighting strong matches)
- "recommendations": (string, 2-3 sentences of actionable advice to bridge the gap)
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const analysis = JSON.parse(cleanJson);
      return res.json(analysis);
    } catch (e) {
      console.error("Gemini gap analysis error, attempting Groq fallback:", e);
      if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
        try {
          const { callGroqAPI } = require("../utils/groq");
          console.log("Routing gap analysis to Groq fallback...");
          const responseText = await callGroqAPI(
            prompt, 
            "You are an expert technical recruiter and resume reviewer returning strictly valid JSON.", 
            true
          );
          const analysis = JSON.parse(responseText);
          return res.json(analysis);
        } catch (errGroq) {
          console.error("Groq gap analysis fallback failed:", errGroq);
          throw errGroq;
        }
      }
      throw e;
    }
  } catch (err) {
    console.error("Gap analysis error:", err);
    res.status(500).json({ message: "Failed to perform gap analysis. Service may be overloaded." });
  }
};
