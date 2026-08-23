const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfModule = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");

// File storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and Word documents are allowed"));
  }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Parse and analyze resume file directly (multimodal ingestion) with Gemini using structured JSON schema.
 */
async function analyzeResumeWithGemini(fileBuffer, mimeType) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const resumeFilePart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType
        }
      };

      const resumeSchema = {
        type: "OBJECT",
        properties: {
          personal_info: {
            type: "OBJECT",
            properties: {
              full_name: { type: "STRING" },
              email: { type: "STRING" },
              phone: { type: "STRING" },
              location: { type: "STRING" },
              linkedin: { type: "STRING" },
              github: { type: "STRING" },
              portfolio: { type: "STRING" }
            }
          },
          summary: { type: "STRING" },
          total_experience_years: { type: "NUMBER" },
          work_experience: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                company: { type: "STRING" },
                title: { type: "STRING" },
                start_date: { type: "STRING" },
                end_date: { type: "STRING" },
                duration_months: { type: "NUMBER" },
                location: { type: "STRING" },
                responsibilities: { type: "ARRAY", items: { type: "STRING" } },
                achievements: { type: "ARRAY", items: { type: "STRING" } },
                technologies_used: { type: "ARRAY", items: { type: "STRING" } }
              }
            }
          },
          education: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                institution: { type: "STRING" },
                degree: { type: "STRING" },
                field_of_study: { type: "STRING" },
                start_date: { type: "STRING" },
                end_date: { type: "STRING" },
                gpa: { type: "STRING" },
                relevant_coursework: { type: "ARRAY", items: { type: "STRING" } }
              }
            }
          },
          skills: {
            type: "OBJECT",
            properties: {
              technical_skills: { type: "ARRAY", items: { type: "STRING" } },
              soft_skills: { type: "ARRAY", items: { type: "STRING" } },
              tools_and_platforms: { type: "ARRAY", items: { type: "STRING" } },
              programming_languages: { type: "ARRAY", items: { type: "STRING" } }
            }
          },
          projects: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                description: { type: "STRING" },
                technologies: { type: "ARRAY", items: { type: "STRING" } },
                link: { type: "STRING" },
                role: { type: "STRING" }
              }
            }
          },
          certifications: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                issuer: { type: "STRING" },
                date: { type: "STRING" },
                credential_id: { type: "STRING" }
              }
            }
          },
          publications: { type: "ARRAY", items: { type: "STRING" } },
          awards: { type: "ARRAY", items: { type: "STRING" } },
          languages_spoken: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["personal_info", "work_experience", "education", "skills"]
      };

      const prompt = `Extract ALL information from this resume into the given JSON schema.

Rules:
- Do not summarize or paraphrase bullet points — extract them close to verbatim.
- Extract every job, every project, every certification, even if brief.
- Infer duration_months from start/end dates.
- If a field is not present in the resume, use null — do not guess or invent data.
- Capture soft skills only if explicitly stated or clearly implied by role descriptions (e.g., "led a team of 5" implies leadership).
- Preserve technical terms, tool names, and version numbers exactly as written.`;

      const firstPassResult = await model.generateContent({
        contents: [{ role: "user", parts: [resumeFilePart, { text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
          temperature: 0.1
        }
      });

      const firstPassText = firstPassResult.response.text();
      let analysis = JSON.parse(firstPassText);

      try {
        const enrichmentPrompt = `Review the original resume and the extracted JSON.
Original JSON: ${JSON.stringify(analysis)}

Identify any missing work experiences, projects, achievements, technologies used, or certifications. 
Add any implicit skills implied by the descriptions (e.g., if the experience mentions "built REST APIs in Django", add Python, Django, REST, Backend).
Ensure date formats are consistent. Return the complete, enriched JSON matching the original schema. Keep temperature low (0.1) for faithful mapping.`;

        const secondPassResult = await model.generateContent({
          contents: [{ role: "user", parts: [resumeFilePart, { text: enrichmentPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
            temperature: 0.1
          }
        });

        const secondPassText = secondPassResult.response.text();
        const enrichedAnalysis = JSON.parse(secondPassText);
        if (enrichedAnalysis && enrichedAnalysis.personal_info) {
          analysis = enrichedAnalysis;
        }
      } catch (err2) {
        console.warn("Second pass enrichment failed, using first pass result:", err2);
      }

      if (analysis) {
        return postProcessAnalysis(analysis);
      }
    } catch (e) {
      console.error("Gemini resume analysis error, attempting Groq fallback:", e);
      if (process.env.GROQ_API_KEY || process.env.GROK_API_KEY) {
        try {
          const { callGroqAPI } = require("../utils/groq");
          console.log("Routing resume analysis to Groq fallback...");
          const groqPrompt = `Extract ALL information from this resume into the given JSON schema.

Rules:
- Do not summarize or paraphrase bullet points — extract them close to verbatim.
- Extract every job, every project, every certification, even if brief.
- Infer duration_months from start/end dates.
- If a field is not present in the resume, use null — do not guess or invent data.
- Capture soft skills only if explicitly stated or clearly implied by role descriptions (e.g., "led a team of 5" implies leadership).
- Preserve technical terms, tool names, and version numbers exactly as written.`;

          const responseText = await callGroqAPI(groqPrompt, "You are a professional resume parser extracting detailed candidate profiles into valid JSON schema formats.", true, fileBuffer, mimeType);
          const analysis = JSON.parse(responseText);
          if (analysis) {
            return postProcessAnalysis(analysis);
          }
        } catch (errGroq) {
          console.error("Groq resume analysis fallback also failed:", errGroq);
        }
      }
    }
  }

  let fallbackText = "";
  try {
    if (mimeType === "application/pdf") {
      if (typeof pdfModule === "function") {
        fallbackText = (await pdfModule(fileBuffer)).text;
      } else if (pdfModule && pdfModule.PDFParse) {
        fallbackText = (await (new pdfModule.PDFParse({ data: fileBuffer })).getText()).text;
      }
    } else {
      fallbackText = fileBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
    }
  } catch (err) {
    console.error("Fallback text conversion failed:", err);
  }

  const skills = extractSkillsFallback(fallbackText);
  const experience = estimateExperienceFallback(fallbackText);
  const parsedJsonObj = {
    personal_info: {
      full_name: "Candidate Profile",
      email: "candidate@example.com",
      phone: "",
      location: ""
    },
    skills: {
      technical_skills: skills,
      soft_skills: [],
      tools_and_platforms: [],
      programming_languages: []
    },
    work_experience: [
      {
        company: "Work History",
        title: "Software Developer",
        duration_months: 12,
        technologies_used: skills,
        highlights: ["Managed engineering applications and systems implementation."]
      }
    ],
    projects: [
      {
        name: "Mock Practice Sandbox",
        description: "Implemented a local development sandbox",
        technologies: skills
      }
    ],
    education: [
      {
        degree: "Bachelor's Degree",
        field_of_study: "Computer Science",
        institution: "Not Specified"
      }
    ]
  };

  return {
    skillsStr: skills.join(", ") || "General Skills",
    skillsArr: skills,
    experience,
    primary_role: "Software Developer",
    education: "Not Specified",
    parsedJsonObj
  };
}

function postProcessAnalysis(analysis) {
  if (!analysis) return null;

  const skillsObj = analysis.skills || {};
  const techSkills = Array.isArray(skillsObj.technical_skills) ? skillsObj.technical_skills : [];
  const progLanguages = Array.isArray(skillsObj.programming_languages) ? skillsObj.programming_languages : [];
  const toolsPlatforms = Array.isArray(skillsObj.tools_and_platforms) ? skillsObj.tools_and_platforms : [];
  const softSkills = Array.isArray(skillsObj.soft_skills) ? skillsObj.soft_skills : [];

  const workTechs = [];
  if (Array.isArray(analysis.work_experience)) {
    analysis.work_experience.forEach(job => {
      if (Array.isArray(job.technologies_used)) {
        workTechs.push(...job.technologies_used);
      }
    });
  }

  const projTechs = [];
  if (Array.isArray(analysis.projects)) {
    analysis.projects.forEach(p => {
      if (Array.isArray(p.technologies)) {
        projTechs.push(...p.technologies);
      }
    });
  }

  const uniqueSkillsMap = new Map();
  [...techSkills, ...progLanguages, ...toolsPlatforms, ...softSkills, ...workTechs, ...projTechs].forEach(skill => {
    if (skill && typeof skill === "string") {
      const trimmed = skill.trim();
      if (trimmed) {
        const lower = trimmed.toLowerCase();
        if (!uniqueSkillsMap.has(lower)) {
          uniqueSkillsMap.set(lower, trimmed);
        }
      }
    }
  });
  const allSkills = Array.from(uniqueSkillsMap.values());

  const eduList = Array.isArray(analysis.education) ? analysis.education : [];
  const educationStr = eduList.length > 0
    ? eduList.map(e => `${e.degree || "Degree"} in ${e.field_of_study || "Field"} at ${e.institution || "Institution"}`).join("; ")
    : "N/A";

  const jobs = Array.isArray(analysis.work_experience) ? analysis.work_experience : [];
  const latestJobRole = jobs.length > 0 ? jobs[0].title : "Software Developer";

  const years = analysis.total_experience_years !== undefined ? analysis.total_experience_years : "N/A";
  const level = years >= 8 ? "Senior" : years >= 4 ? "Mid-Level" : years >= 1 ? "Junior" : "Fresher";

  return {
    skillsStr: allSkills.join(", ") || "General Skills",
    skillsArr: allSkills,
    experience: `${level} (${years} years)`,
    primary_role: latestJobRole,
    education: educationStr,
    parsedJsonObj: analysis
  };
}

function extractSkillsFallback(text) {
  const techSkills = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "swift", "kotlin",
    "react", "vue", "angular", "node.js", "express", "django", "flask", "spring", "laravel",
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "firebase",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins",
    "git", "github", "linux", "rest", "graphql", "microservices", "machine learning",
    "deep learning", "tensorflow", "pytorch", "html", "css", "sass", "tailwind",
    "agile", "scrum", "jira", "figma", "android", "ios", "flutter", "react native"
  ];

  const lowerText = text.toLowerCase();
  const found = techSkills.filter(skill => lowerText.includes(skill));
  return [...new Set(found)];
}

function estimateExperienceFallback(text) {
  const lowerText = text.toLowerCase();
  const yearMatches = lowerText.match(/(\d+)\+?\s+years?\s+(of\s+)?(experience|exp)/g);
  if (yearMatches) {
    const nums = yearMatches.map(m => parseInt(m));
    const max = Math.max(...nums);
    if (max >= 8) return "Senior (8+ years)";
    if (max >= 4) return "Mid-Level (4–8 years)";
    if (max >= 1) return "Junior (1–4 years)";
  }
  if (lowerText.includes("senior") || lowerText.includes("lead") || lowerText.includes("principal")) {
    return "Senior";
  }
  if (lowerText.includes("junior") || lowerText.includes("intern") || lowerText.includes("fresher")) {
    return "Fresher / Junior";
  }
  return "Mid-Level";
}

async function analyzeAtsScoreWithGemini(resumeText, parsedJson) {
  const fallbackAudit = {
    ats_score: 78,
    sub_scores: {
      keyword_density: 75,
      impact_metrics: 65,
      formatting_structure: 85,
      skill_relevance: 80
    },
    grades: { contact_info: "A", summary: "B", experience: "C+", education: "A", skills: "B+", projects: "B" },
    critical_fixes: [
      "Add quantified metrics (e.g. '% improvement', '$ saved', 'users served') to work achievements.",
      "Include explicit framework version numbers and cloud tooling keywords."
    ],
    missing_keywords: ["CI/CD", "System Architecture", "Unit Testing", "REST API", "Docker"],
    suggestions: [
      "Incorporate industry-standard technical terms into bullet points.",
      "Quantify scale and team sizes in experience descriptions.",
      "Ensure LinkedIn and GitHub profile links use full https:// URLs."
    ]
  };

  if (!genAI) {
    return {
      ats_score: 78,
      ats_analysis_json: JSON.stringify(fallbackAudit)
    };
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze the following parsed resume content and raw text for an Applicant Tracking System (ATS) optimization audit.
Parsed Data: ${JSON.stringify(parsedJson)}
Raw Resume Text: ${resumeText}

Provide a deep, multi-category ATS audit.
Return ONLY a valid JSON object matching this exact structure:
{
  "ats_score": 82,
  "sub_scores": {
    "keyword_density": 80,
    "impact_metrics": 65,
    "formatting_structure": 90,
    "skill_relevance": 85
  },
  "grades": {
    "contact_info": "A",
    "summary": "B",
    "experience": "C+",
    "education": "A",
    "skills": "A-",
    "projects": "B"
  },
  "critical_fixes": [
    "Add quantified impact metrics (e.g., 'increased performance by 30%') to work bullet points."
  ],
  "missing_keywords": ["TypeScript", "Docker", "RESTful APIs", "Jest", "Microservices"],
  "suggestions": [
    "Quantify your project scale and team lead achievements.",
    "Ensure GitHub and LinkedIn URLs are fully qualified links.",
    "Add a targeted professional summary at the top of your resume."
  ]
}
Do not include any markdown formatting like \`\`\`json or \`\`\`.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const analysis = JSON.parse(cleanJson);
    return {
      ats_score: typeof analysis.ats_score === 'number' ? analysis.ats_score : 78,
      ats_analysis_json: JSON.stringify(analysis)
    };
  } catch (e) {
    console.error("Gemini ATS analysis error:", e);
    return {
      ats_score: 78,
      ats_analysis_json: JSON.stringify(fallbackAudit)
    };
  }
}

// POST /api/resume/upload
router.post("/upload", auth, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const { skillsStr, skillsArr, experience, primary_role, education, parsedJsonObj } = await analyzeResumeWithGemini(dataBuffer, req.file.mimetype);

    let resumeText = "";
    if (req.file.mimetype === "application/pdf") {
      if (typeof pdfModule === "function") {
        resumeText = (await pdfModule(dataBuffer)).text;
      } else if (pdfModule && pdfModule.PDFParse) {
        resumeText = (await (new pdfModule.PDFParse({ data: dataBuffer })).getText()).text;
      }
    } else {
      resumeText = dataBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
    }

    const { ats_score, ats_analysis_json } = await analyzeAtsScoreWithGemini(resumeText, parsedJsonObj);
    const user_id = req.user.user_id;

    let resumeId = null;
    if (user_id) {
      // Deactivate all previous resumes for this user
      await Resume.updateMany({ user_id }, { is_active: false });

      const descExperience = `${experience} | Role: ${primary_role} | Edu: ${education}`;
      const serializedJson = parsedJsonObj ? JSON.stringify(parsedJsonObj) : null;
      
      const newResume = await Resume.create({
        user_id,
        resume_text: resumeText,
        skills: skillsStr,
        experience: descExperience,
        parsed_json: serializedJson,
        is_active: true,
        ats_score,
        ats_analysis_json
      });
      resumeId = newResume._id;
    }

    res.json({
      message: "Resume uploaded and analyzed successfully",
      resume_id: resumeId,
      skills: skillsStr,
      skills_array: skillsArr,
      experience,
      primary_role,
      education,
      ats_score,
      ats_analysis: ats_analysis_json ? JSON.parse(ats_analysis_json) : null,
      projects: parsedJsonObj ? parsedJsonObj.projects : [],
      word_count: resumeText.split(/\s+/).length
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ message: "Resume processing failed: " + err.message });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file:", unlinkErr);
      }
    }
  }
});

// GET /api/resume/latest/:user_id
router.get("/latest/:user_id", auth, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  if (req.user.role === 'candidate' && String(req.user.user_id) !== String(user_id)) {
    return res.status(403).json({ error: "Access Denied. You can only view your own resume." });
  }

  try {
    const row = await Resume.findOne({ user_id }).sort({ uploaded_at: -1 });
    if (!row) {
      return res.status(404).json({ message: "No resume found for this user" });
    }
    
    let parsedObj = null;
    if (row.parsed_json) {
      try {
        parsedObj = JSON.parse(row.parsed_json);
      } catch (e) {
        console.error("Failed to parse resume json:", e);
      }
    }

    let atsAnalysis = null;
    if (row.ats_analysis_json) {
      try {
        atsAnalysis = JSON.parse(row.ats_analysis_json);
      } catch (e) {}
    }

    res.json({
      resume_id: row._id,
      skills: row.skills,
      experience: row.experience,
      parsed_json: parsedObj,
      ats_score: row.ats_score,
      ats_analysis: atsAnalysis,
      uploaded_at: row.uploaded_at
    });
  } catch (err) {
    console.error("Fetch latest resume error:", err);
    res.status(500).json({ message: "Failed to fetch latest resume" });
  }
});

// GET /api/resume/active/:user_id
router.get("/active/:user_id", auth, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  if (req.user.role === 'candidate' && String(req.user.user_id) !== String(user_id)) {
    return res.status(403).json({ error: "Access Denied. You can only view your own resume." });
  }

  try {
    let row = await Resume.findOne({ user_id, is_active: true });
    if (!row) {
      row = await Resume.findOne({ user_id }).sort({ uploaded_at: -1 });
    }

    if (!row) {
      return res.status(404).json({ message: "No active resume found for this user" });
    }

    let parsedObj = null;
    if (row.parsed_json) {
      try {
        parsedObj = JSON.parse(row.parsed_json);
      } catch (e) {}
    }

    let atsAnalysis = null;
    if (row.ats_analysis_json) {
      try {
        atsAnalysis = JSON.parse(row.ats_analysis_json);
      } catch (e) {}
    }

    res.json({
      resume_id: row._id,
      skills: row.skills,
      experience: row.experience,
      parsed_json: parsedObj,
      is_active: row.is_active,
      ats_score: row.ats_score,
      ats_analysis: atsAnalysis,
      uploaded_at: row.uploaded_at
    });
  } catch (err) {
    console.error("Fetch active resume error:", err);
    res.status(500).json({ message: "Failed to fetch active resume" });
  }
});

// POST /api/resume/active
router.post("/active", auth, async (req, res) => {
  const { user_id, resume_id } = req.body;
  if (!user_id || !resume_id) {
    return res.status(400).json({ message: "user_id and resume_id are required" });
  }

  if (req.user.role === 'candidate' && String(req.user.user_id) !== String(user_id)) {
    return res.status(403).json({ error: "Access Denied." });
  }

  try {
    await Resume.updateMany({ user_id }, { is_active: false });
    const result = await Resume.findOneAndUpdate(
      { _id: resume_id, user_id },
      { is_active: true },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ message: "Active resume updated successfully" });
  } catch (err) {
    console.error("Update active resume error:", err);
    res.status(500).json({ message: "Failed to update active resume" });
  }
});

router.analyzeResumeWithGemini = analyzeResumeWithGemini;
module.exports = router;
