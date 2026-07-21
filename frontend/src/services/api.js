/**
 * services/api.js — Backend API client for the React application
 */

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(path, options = {}) {
  try {
    const headers = {
      "Authorization": `Bearer ${getToken()}`
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    if ((res.status === 401 || res.status === 403) && !path.startsWith("/auth/")) {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent("auth_expired"));
      return { data: null, error: "Session expired" };
    }

    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || data.error || "Request failed" };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: "Cannot connect to server. Is the backend running on port 5055?" };
  }
}

export const api = {
  register: (full_name, email, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password })
    }),

  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  uploadResume: (formData) =>
    apiFetch("/resume/upload", {
      method: "POST",
      body: formData
    }),

  getActiveResume: (user_id) =>
    apiFetch(`/resume/active/${user_id}`),

  setActiveResume: (user_id, resume_id) =>
    apiFetch("/resume/active", {
      method: "POST",
      body: JSON.stringify({ user_id, resume_id })
    }),

  startInterview: (user_id, resume_id = null) =>
    apiFetch("/interview/start", {
      method: "POST",
      body: JSON.stringify({ user_id, resume_id })
    }),

  saveAnswer: (formData) =>
    apiFetch("/interview/answer", {
      method: "POST",
      body: formData
    }),

  finishInterview: (interview_id, attention_score = null, look_away_count = null) =>
    apiFetch("/interview/finish", {
      method: "POST",
      body: JSON.stringify({ interview_id, attention_score, look_away_count })
    }),

  getResults: (interview_id) =>
    apiFetch(`/interview/results/${interview_id}`),

  getHistory: (user_id) =>
    apiFetch(`/interview/history/${user_id}`),

  getDashboardStats: (user_id, period = '30', start = '', end = '') => {
    let url = `/interview/stats/${user_id}?period=${period}`;
    if (start && end) {
      url += `&start=${start}&end=${end}`;
    }
    return apiFetch(url);
  },

  analyzeGap: (user_id, resume_id, job_description) =>
    apiFetch("/interview/gap-analysis", {
      method: "POST",
      body: JSON.stringify({ user_id, resume_id, job_description })
    }),

  getSettings: (user_id) =>
    apiFetch(`/settings/${user_id}`),

  saveSettings: (user_id, settings) =>
    apiFetch("/settings", {
      method: "POST",
      body: JSON.stringify({ user_id, settings })
    }),

  getLatestResume: (user_id) =>
    apiFetch(`/resume/latest/${user_id}`),

  updateProfile: (profileData) =>
    apiFetch("/auth/update-profile", {
      method: "POST",
      body: JSON.stringify(profileData)
    }),

  askCourseQuestion: (question) =>
    apiFetch("/courses/ask", {
      method: "POST",
      body: JSON.stringify({ question })
    })
};
