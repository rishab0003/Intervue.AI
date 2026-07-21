import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ExternalLink, CheckCircle2, ArrowRight,
  GraduationCap, ChevronDown, ChevronUp, Send, RotateCcw,
  Zap, Target, Map, Bot, Play, Globe, GitBranch, FileText
} from 'lucide-react';

/* ─────────────────────────────────────────
   STATIC DATA — Career Tracks
───────────────────────────────────────── */
const CAREER_TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend Engineer Track',
    emoji: '⚛️',
    description: 'Master React mechanics, state management, client-side performance, and modern browser APIs to ace frontend interviews.',
    accentClass: 'border-l-blue-500',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30',
    pillClass: 'bg-blue-500',
    links: [
      { id: 'fe-1', name: 'Frontend Developer Roadmap', source: 'roadmap.sh', url: 'https://roadmap.sh/frontend', type: 'guide' },
      { id: 'fe-2', name: 'React Official Reference Docs', source: 'react.dev', url: 'https://react.dev/reference/react', type: 'docs' },
      { id: 'fe-3', name: 'Full React Course (5 hrs)', source: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', type: 'video' },
      { id: 'fe-4', name: 'JavaScript Complete Guide', source: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'docs' },
      { id: 'fe-5', name: 'CSS Layout & Grid Deep Dive', source: 'CSS Tricks', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'docs' },
      { id: 'fe-6', name: 'Web Performance Fundamentals', source: 'web.dev', url: 'https://web.dev/performance/', type: 'guide' },
    ]
  },
  {
    id: 'backend',
    title: 'Backend & DB Architect Track',
    emoji: '💾',
    description: 'Master API design, database schemas, query optimisation, caching layers, and server-side security for technical rounds.',
    accentClass: 'border-l-emerald-500',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30',
    pillClass: 'bg-emerald-500',
    links: [
      { id: 'be-1', name: 'Backend Developer Roadmap', source: 'roadmap.sh', url: 'https://roadmap.sh/backend', type: 'guide' },
      { id: 'be-2', name: 'Interactive SQL Tutorial', source: 'SQLZoo', url: 'https://sqlzoo.net/', type: 'interactive' },
      { id: 'be-3', name: 'Node.js & Express Full Course', source: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', type: 'video' },
      { id: 'be-4', name: 'PostgreSQL Official Docs', source: 'PostgreSQL', url: 'https://www.postgresql.org/docs/', type: 'docs' },
      { id: 'be-5', name: 'REST API Design Best Practices', source: 'Stoplight', url: 'https://stoplight.io/api-types/restful-api', type: 'guide' },
      { id: 'be-6', name: 'Database Indexing Explained', source: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/', type: 'guide' },
    ]
  },
  {
    id: 'system',
    title: 'System Design & DevOps Track',
    emoji: '☁️',
    description: 'Understand distributed architectures, cloud caching, containers, load balancers, and CI/CD pipelines for senior rounds.',
    accentClass: 'border-l-amber-500',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30',
    pillClass: 'bg-amber-500',
    links: [
      { id: 'sd-1', name: 'System Design Guide', source: 'roadmap.sh', url: 'https://roadmap.sh/system-design', type: 'guide' },
      { id: 'sd-2', name: 'System Design Primer', source: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer', type: 'github' },
      { id: 'sd-3', name: 'ByteByteGo — System Design Videos', source: 'YouTube', url: 'https://www.youtube.com/results?search_query=bytebytego+system+design', type: 'video' },
      { id: 'sd-4', name: 'Docker for Beginners', source: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'video' },
      { id: 'sd-5', name: 'Kubernetes Full Course', source: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'video' },
      { id: 'sd-6', name: 'AWS Solutions Architect Prep', source: 'roadmap.sh', url: 'https://roadmap.sh/aws', type: 'guide' },
    ]
  },
  {
    id: 'dsa',
    title: 'DSA & Problem Solving Track',
    emoji: '🧩',
    description: 'Build pattern recognition for LeetCode problems — arrays, trees, graphs, dynamic programming, and complexity analysis.',
    accentClass: 'border-l-purple-500',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30',
    pillClass: 'bg-purple-500',
    links: [
      { id: 'ds-1', name: 'LeetCode — Practice Problems', source: 'LeetCode', url: 'https://leetcode.com/', type: 'interactive' },
      { id: 'ds-2', name: 'NeetCode — Structured Learning Path', source: 'NeetCode', url: 'https://neetcode.io/practice', type: 'guide' },
      { id: 'ds-3', name: 'Big-O Cheat Sheet', source: 'BigOCheatSheet', url: 'https://www.bigocheatsheet.com/', type: 'guide' },
      { id: 'ds-4', name: 'Algorithms by Abdul Bari (Video)', source: 'YouTube', url: 'https://www.youtube.com/watch?v=0IAPZzGSbME', type: 'video' },
      { id: 'ds-5', name: 'Data Structures Full Course', source: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video' },
      { id: 'ds-6', name: 'Grokking Algorithms (Book Summary)', source: 'GitHub', url: 'https://github.com/egonSchiele/grokking_algorithms', type: 'github' },
    ]
  }
];

/* ─────────────────────────────────────────
   STATIC DATA — Quick Prompts
───────────────────────────────────────── */
const QUICK_PROMPTS = [
  'What is the STAR method?',
  'Explain rate limiting',
  'REST vs GraphQL',
  'What is Big-O notation?',
  'SQL indexing explained',
  'What is event loop in Node.js?',
  'How does React reconciliation work?',
  'What is CAP theorem?',
];

/* ─────────────────────────────────────────
   HELPER — Resource type icon
───────────────────────────────────────── */
function SourceBadge({ type }) {
  const map = {
    video: { icon: <Play size={10} />, label: 'Video', cls: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/30' },
    docs: { icon: <FileText size={10} />, label: 'Docs', cls: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-slate-200 dark:border-white/10' },
    guide: { icon: <Globe size={10} />, label: 'Guide', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/20' },
    github: { icon: <GitBranch size={10} />, label: 'GitHub', cls: 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border-slate-200 dark:border-white/10' },
    interactive: { icon: <Zap size={10} />, label: 'Practice', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/20' },
  };
  const t = map[type] || map.guide;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${t.cls}`}>
      {t.icon}{t.label}
    </span>
  );
}

/* ─────────────────────────────────────────
   COMPONENT — Track Card
───────────────────────────────────────── */
function TrackCard({ track, completedLinks, onToggle }) {
  const [open, setOpen] = useState(false);
  const trackTotal = track.links.length;
  const trackDone = track.links.filter(l => !!completedLinks[l.id]).length;
  const pct = trackTotal > 0 ? Math.round((trackDone / trackTotal) * 100) : 0;

  return (
    <Card className={`border-l-4 ${track.accentClass} overflow-hidden`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span className="text-2xl flex-shrink-0">{track.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-dashboard-dark dark:text-white uppercase tracking-tight">
              {track.title}
            </h3>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-widest ${track.badgeClass}`}>
              {trackDone}/{trackTotal} done
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mt-1 max-w-2xl hidden sm:block">
            {track.description}
          </p>
          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${track.pillClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[10px] font-extrabold text-text-muted tabular-nums">{pct}%</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-text-muted group-hover:text-text-primary transition-colors">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable resource grid */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {track.links.map(link => {
                  const isDone = !!completedLinks[link.id];
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all ${
                        isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/20'
                          : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/5'
                      }`}
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[200px] hover:underline transition-colors leading-tight">
                            {link.name}
                          </span>
                          <ExternalLink size={9} className="text-slate-400 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-bold text-text-muted">{link.source}</span>
                          <SourceBadge type={link.type} />
                        </div>
                      </a>
                      <button
                        onClick={() => onToggle(link.id)}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600'
                        }`}
                        title={isDone ? 'Mark as unread' : 'Mark as done'}
                      >
                        {isDone ? <><CheckCircle2 size={10} className="text-emerald-500" /> Done</> : <>Study</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ─────────────────────────────────────────
   COMPONENT — Chat Bubble
───────────────────────────────────────── */
function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <Mascot pose="neutral" size={38} className="flex-shrink-0" />
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-medium shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-bl-sm'
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────── */
export const Courses = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tracks');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track progress stored in localStorage
  const [completedLinks, setCompletedLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('intervue_completed_courses');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // AI Companion Chat state
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm your AI Interview Coach. Ask me anything — rate limiting, STAR method, Big-O, system design, or any concept you want explained for your interview. 🎯" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const loadStats = async () => {
    try {
      const { data } = await api.getDashboardStats(user.user_id, 'all');
      if (data) setStats(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const toggleLinkCompletion = (linkId) => {
    setCompletedLinks(prev => {
      const updated = { ...prev, [linkId]: !prev[linkId] };
      localStorage.setItem('intervue_completed_courses', JSON.stringify(updated));
      return updated;
    });
    showToast('Progress updated! 🎯', 'success');
  };

  const handleSendMessage = async (questionText) => {
    const q = (questionText || chatInput).trim();
    if (!q) return;

    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    const { data, error } = await api.askCourseQuestion(q);
    if (data?.answer) {
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: error || "Sorry, I couldn't get an answer right now. Please try again in a moment."
      }]);
    }
    setChatLoading(false);
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // Derived
  const recommendations = stats?.latestRecommendations || [];
  const completedCount = Object.values(completedLinks).filter(Boolean).length;
  const totalLinks = CAREER_TRACKS.reduce((s, t) => s + t.links.length, 0);

  const TABS = [
    { id: 'tracks', label: 'Career Tracks', icon: <Map size={14} /> },
    { id: 'companion', label: 'AI Companion', icon: <Bot size={14} /> },
    { id: 'recommendations', label: 'AI Recommendations', icon: <Sparkles size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex-1 bg-dashboard-bg flex flex-col items-center justify-center gap-3 p-12 min-h-screen">
        <Mascot pose="neutral" size={64} className="animate-bounce" />
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Loading your courses hub...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 bg-dashboard-bg min-h-screen pb-24"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 flex flex-col gap-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-900/10 dark:border-white/5 pb-8">
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-black text-text-muted uppercase tracking-[0.25em]">
              <span>Courses Hub</span> / <span>Learning Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-dashboard-dark dark:text-white tracking-[-0.03em] uppercase leading-[0.95] font-bold-display mt-2">
              Your Learning<br className="hidden sm:inline" /> Hub 📚
            </h1>
            <p className="text-sm text-text-secondary mt-3 max-w-lg leading-relaxed">
              Structured career tracks, an AI-powered study companion, and personalised recommendations based on your mock interview performance.
            </p>
          </div>

          {/* Overall Progress Pill */}
          <div className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex-shrink-0">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
              <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Overall Progress</span>
              <span className="text-lg font-black text-dashboard-dark dark:text-white">{completedCount} / {totalLinks}</span>
              <div className="w-32 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalLinks > 0 ? Math.round((completedCount / totalLinks) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-white/10'
                  : 'text-text-muted hover:text-text-primary dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'recommendations' && recommendations.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* TAB 1 — Career Tracks */}
          {activeTab === 'tracks' && (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">
                {CAREER_TRACKS.length} tracks · {totalLinks} resources — click a track to expand
              </p>
              {CAREER_TRACKS.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  completedLinks={completedLinks}
                  onToggle={toggleLinkCompletion}
                />
              ))}
            </motion.div>
          )}

          {/* TAB 2 — AI Companion Chat */}
          {activeTab === 'companion' && (
            <motion.div
              key="companion"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-text-muted uppercase tracking-widest">Powered by Gemini AI</p>
                  <h2 className="text-lg font-black text-dashboard-dark dark:text-white mt-0.5">Ask your AI Interview Coach</h2>
                </div>
                <button
                  onClick={() => setMessages([{ role: 'ai', text: "Hey! I'm your AI Interview Coach. Ask me anything — rate limiting, STAR method, Big-O, system design, or any concept you want explained for your interview. 🎯" }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted border border-slate-200 dark:border-white/10 rounded-xl hover:text-text-primary hover:border-slate-300 transition-all cursor-pointer"
                  title="Clear chat"
                >
                  <RotateCcw size={11} /> Clear
                </button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={chatLoading}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Window */}
              <Card className="flex flex-col h-[420px] overflow-hidden p-0">
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} role={msg.role} text={msg.text} />
                  ))}
                  {chatLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end gap-2"
                    >
                      <Mascot pose="thinking" size={38} className="flex-shrink-0" />
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-slate-100 dark:border-white/5 p-4 flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask a technical concept, framework, algorithm..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    disabled={chatLoading}
                    className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-60"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={13} />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 3 — AI Recommendations */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-xs font-black text-text-muted uppercase tracking-widest">Personalised based on your last mock interview</p>
                <h2 className="text-lg font-black text-dashboard-dark dark:text-white mt-0.5">AI-Identified Knowledge Gaps</h2>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Card className="p-5 flex flex-col gap-4 border border-blue-100/60 dark:border-blue-900/20 hover:border-blue-300/50 dark:hover:border-blue-700/40 transition-all h-full">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <Target size={15} />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Focus Area</span>
                            <h3 className="text-sm font-bold text-dashboard-dark dark:text-white leading-tight mt-0.5">{rec.topic}</h3>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {rec.links.map((link, j) => {
                            const linkId = `ai-${i}-${j}`;
                            const isDone = !!completedLinks[linkId];
                            return (
                              <div
                                key={j}
                                className={`flex items-center justify-between rounded-xl px-3 py-2 border transition-all ${
                                  isDone
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/40 dark:border-emerald-800/20'
                                    : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5'
                                }`}
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors max-w-[170px] truncate"
                                >
                                  <span>{link.icon || '🔗'}</span>
                                  <span className="truncate">{link.name}</span>
                                </a>
                                <button
                                  onClick={() => toggleLinkCompletion(linkId)}
                                  className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                                    isDone
                                      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600'
                                  }`}
                                >
                                  {isDone ? <><CheckCircle2 size={9} className="text-emerald-500" /> Done</> : 'Study'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="flex flex-col sm:flex-row items-center gap-6 p-8 border border-slate-200 dark:border-white/5 max-w-3xl">
                  <Mascot pose="encourage" size={72} className="flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-bold text-dashboard-dark dark:text-white">No personalised recommendations yet</h3>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed max-w-md">
                      Complete your first AI-powered mock interview and our system will automatically identify your weakest topics and surface targeted learning resources here.
                    </p>
                    <Link
                      to="/interview"
                      className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] shadow-sm"
                    >
                      Start Mock Interview <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Courses;
