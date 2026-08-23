import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import PersonaCard from '../components/PersonaCard';
import Button from '../components/Button';
import { Smile, User, Zap, Sparkles, Sliders, Target, Volume2, Eye, MessageSquare, Clock, CheckCircle2, Plus, FileText, Wind, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeTab, setActiveTab] = useState('role'); // 'role' | 'pacing' | 'proctoring'

  // Form States
  const [persona, setPersona] = useState('friendly');
  const [pressure, setPressure] = useState('gentle');
  const [focusMode, setFocusMode] = useState('general');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  const [proctoring, setProctoring] = useState(true);
  const [conversational, setConversational] = useState(true);
  const [noise, setNoise] = useState('none');
  const [breathing, setBreathing] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('');

  const [activeResumeSkills, setActiveResumeSkills] = useState([]);
  const [activeResumeMeta, setActiveResumeMeta] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.getSettings(user.user_id);
      if (!error && data) {
        setPersona(data.interviewer_persona || 'friendly');
        setPressure(data.pressure_level || 'gentle');
        setFocusMode(data.focus_mode || 'general');
        setQuestionCount(data.question_count !== undefined ? data.question_count : 10);
        setTimeLimit(data.time_limit !== undefined ? data.time_limit : 60);
        setProctoring(data.camera_proctoring !== undefined ? data.camera_proctoring : true);
        setConversational(data.conversational_mode !== undefined ? data.conversational_mode : true);
        setNoise(data.noise_simulation || 'none');
        setBreathing(data.breathing_exercise !== undefined ? data.breathing_exercise : false);
        setTargetRole(data.target_role || 'Software Engineer');
        setJobDescription(data.job_description || '');
        if (data.job_description && data.job_description.trim().length > 0) {
          setShowJdInput(true);
        }
      }

      const resumeRes = await api.getActiveResume(user.user_id);
      if (!resumeRes.error && resumeRes.data) {
        setActiveResumeMeta(resumeRes.data);
        if (resumeRes.data.skills) {
          const skillsArr = resumeRes.data.skills.split(',').map(s => s.trim()).filter(s => s);
          setActiveResumeSkills(skillsArr.slice(0, 10));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetName) => {
    if (presetName === 'faang') {
      setPersona('strict');
      setPressure('realistic');
      setFocusMode('technical');
      setQuestionCount(12);
      setTimeLimit(45);
      setProctoring(true);
      setConversational(true);
      showToast('Applied FAANG Technical preset! 🚀', 'info');
    } else if (presetName === 'startup') {
      setPersona('friendly');
      setPressure('standard');
      setFocusMode('general');
      setQuestionCount(8);
      setTimeLimit(60);
      setProctoring(false);
      setConversational(true);
      showToast('Applied Fast Startup preset! 💡', 'info');
    } else if (presetName === 'hr') {
      setPersona('friendly');
      setPressure('gentle');
      setFocusMode('non-technical');
      setQuestionCount(6);
      setTimeLimit(90);
      setProctoring(true);
      setConversational(true);
      showToast('Applied Behavioral HR preset! 🎯', 'info');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const settingsPayload = {
      interviewer_persona: persona,
      pressure_level: pressure,
      focus_mode: focusMode,
      question_count: questionCount,
      time_limit: timeLimit,
      camera_proctoring: proctoring,
      conversational_mode: conversational,
      noise_simulation: noise,
      breathing_exercise: breathing,
      target_role: targetRole,
      job_description: jobDescription,
      focus_skills: activeResumeSkills
    };

    try {
      const { error } = await api.saveSettings(user.user_id, settingsPayload);
      if (error) {
        showToast(error, 'error');
        return;
      }
      showToast('Setup saved successfully! 🎯', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Cannot connect to server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-dashboard-bg min-h-screen">
        <Mascot pose="neutral" size={80} className="animate-bounce" />
        <span className="text-sm font-bold text-text-secondary mt-3">Loading setup workspace...</span>
      </div>
    );
  }

  const selectionCardClass = (isSelected) =>
    `border p-4 sm:p-5 text-left flex flex-col justify-between gap-2.5 cursor-pointer transition-all rounded-2xl ${
      isSelected
        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
        : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-zinc-900/60'
    }`;

  const tabs = [
    { id: 'role', label: 'Target & Style', icon: Target },
    { id: 'pacing', label: 'Pacing & Timing', icon: Clock },
    { id: 'proctoring', label: 'Environment & AI', icon: Sliders },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-dashboard-bg min-h-screen pb-24 text-left relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-8 flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
          <div>
            <div className="text-xs font-black text-text-muted uppercase tracking-[0.25em] mb-1">
              Configuration Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interview Setup
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
              Configure your role context, difficulty pacing, and AI interview experience.
            </p>
          </div>

          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <CheckCircle2 size={16} /> Save & Apply
          </Button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Quick Presets</span>
              <p className="text-[11px] text-text-secondary mt-0.5">1-click environment configurations</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'faang', label: '🚀 FAANG Technical' },
              { id: 'startup', label: '💡 Fast Startup' },
              { id: 'hr', label: '🎯 Behavioral HR' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10'
                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Content Area (Left 2 Cols), Summary Card (Right 1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Tab Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <AnimatePresence mode="wait">

              {/* ── TAB 1: Target Role & Style ── */}
              {activeTab === 'role' && (
                <motion.div key="tab-role" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">
                  
                  {/* Target Role & Resume Skills Card */}
                  <Card className="p-6 flex flex-col gap-5 text-left bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                          <Target size={18} />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Target Job Role & Resume Context</h2>
                          <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">Define your goal position to align AI interview questions</p>
                        </div>
                      </div>

                      {activeResumeMeta ? (
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 px-3 py-1.5 rounded-full shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Resume Linked ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate('/upload')}
                          className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          + Link Resume
                        </button>
                      )}
                    </div>

                    {/* Target Job Title Input (Full Width) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">Target Job Title</label>
                      <div className="relative flex items-center">
                        <User size={16} className="absolute left-3.5 text-slate-400 dark:text-white/30" />
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g. Software Engineer, Full Stack Developer, Data Analyst"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Extracted Skills Section */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-indigo-500" />
                          Auto-Detected Resume Skills ({activeResumeSkills.length})
                        </label>
                        {activeResumeSkills.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-white/30">Auto-extracted from your latest resume</span>
                        )}
                      </div>

                      {activeResumeSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-white/5 rounded-2xl">
                          {activeResumeSkills.map((sk, i) => {
                            const formatted = sk.toLowerCase() === 'javascript' ? 'JavaScript'
                              : sk.toLowerCase() === 'typescript' ? 'TypeScript'
                              : sk.toLowerCase() === 'python' ? 'Python'
                              : sk.toLowerCase() === 'java' ? 'Java'
                              : sk.toLowerCase() === 'c++' ? 'C++'
                              : sk.toLowerCase() === 'go' || sk.toLowerCase() === 'golang' ? 'Go'
                              : sk.toLowerCase() === 'react' ? 'React'
                              : sk.toLowerCase() === 'node.js' || sk.toLowerCase() === 'nodejs' ? 'Node.js'
                              : sk.toLowerCase() === 'express' ? 'Express.js'
                              : sk.toLowerCase() === 'sql' ? 'SQL'
                              : sk.charAt(0).toUpperCase() + sk.slice(1);
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-2xs hover:border-indigo-400/50 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {formatted}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5 rounded-2xl text-xs text-slate-400 dark:text-white/30 font-medium">
                          No resume skills extracted yet. Standard general interview question mix will be used.
                        </div>
                      )}
                    </div>

                    {/* Job Description Input (Collapsible Accordion Card) */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      {!showJdInput ? (
                        <button
                          type="button"
                          onClick={() => setShowJdInput(true)}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200/80 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer group"
                        >
                          <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold">
                            <Plus size={15} /> Add Specific Job Description or Requirements (Optional)
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">Expand ↓</span>
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2.5 p-4 bg-slate-50 dark:bg-zinc-900/60 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <FileText size={13} /> Target Job Posting Requirements
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowJdInput(false)}
                              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
                            >
                              Close
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste target job responsibilities or requirements here to simulate tailored interview questions..."
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-none font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Interviewer Style */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Interviewer Persona</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <PersonaCard
                        name="Friendly Coach"
                        description="Encouraging tone, soft follow-ups."
                        icon={Smile}
                        selected={persona === 'friendly'}
                        onClick={() => setPersona('friendly')}
                      />
                      <PersonaCard
                        name="Neutral Recruiter"
                        description="Standard professional style."
                        icon={User}
                        selected={persona === 'neutral'}
                        onClick={() => setPersona('neutral')}
                      />
                      <PersonaCard
                        name="Strict Examiner"
                        description="Fast pacing, brief feedback."
                        icon={Zap}
                        selected={persona === 'strict'}
                        onClick={() => setPersona('strict')}
                      />
                    </div>
                  </div>

                  {/* Question Focus */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Domain Focus</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'technical', emoji: '💻', label: 'Technical & Coding', desc: 'Algorithms, design, stack.' },
                        { value: 'non-technical', emoji: '💬', label: 'Behavioral & HR', desc: 'STAR format, leadership.' },
                        { value: 'general', emoji: '🧩', label: 'Mixed Resume Focus', desc: 'Balanced pool for skills.' },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setFocusMode(opt.value)}
                          className={selectionCardClass(focusMode === opt.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.emoji}</span>
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">{opt.label}</span>
                            </div>
                            {focusMode === opt.value && <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />}
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* ── TAB 2: Pacing & Timing ── */}
              {activeTab === 'pacing' && (
                <motion.div key="tab-pacing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">

                  {/* Pressure Level */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Pressure Level</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'gentle', emoji: '🌸', label: 'Gentle', desc: 'No timer pressure, helper prompts.' },
                        { value: 'standard', emoji: '⭐', label: 'Standard', desc: '60s per answer, balanced pace.' },
                        { value: 'realistic', emoji: '🔥', label: 'Realistic', desc: '30s strict limit, intense simulation.' },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setPressure(opt.value)}
                          className={selectionCardClass(pressure === opt.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.emoji}</span>
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">{opt.label}</span>
                            </div>
                            {pressure === opt.value && <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />}
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing & Question Count Pills */}
                  <Card className="p-6 flex flex-col gap-6 text-left">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Clock size={16} className="text-indigo-500" />
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Questions & Time Limit</h3>
                    </div>

                    {/* Question Count Pills */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Questions per Session</label>
                      <div className="flex gap-2">
                        {[5, 8, 10, 12, 15].map(cnt => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                              questionCount === cnt
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-indigo-400'
                            }`}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Limit Pills */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Time Limit per Question</label>
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{timeLimit}s</span>
                      </div>
                      <div className="flex gap-2">
                        {[30, 45, 60, 90, 120].map(sec => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setTimeLimit(sec)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                              timeLimit === sec
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-indigo-400'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Breathing Prep Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Wind size={14} className="text-indigo-500" /> Calming 4-7-8 Breathing Warm-up
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Prompt a brief guided relaxation cycle before starting the session</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={breathing}
                          onChange={(e) => setBreathing(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </Card>

                </motion.div>
              )}

              {/* ── TAB 3: Environment & Proctoring ── */}
              {activeTab === 'proctoring' && (
                <motion.div key="tab-proctoring" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">

                  <Card className="p-6 flex flex-col gap-5 text-left">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Sliders size={16} className="text-indigo-500" />
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Proctoring & Audio Environment</h3>
                    </div>

                    {/* Eye Proctoring */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Eye size={14} className="text-indigo-500" /> AI Eye-Gaze Proctoring
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Track eye contact and screen attention via webcam mesh</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={proctoring}
                          onChange={(e) => setProctoring(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* AI Follow ups */}
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-white/5 pt-3">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-indigo-500" /> Conversational Follow-Up Questions
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">AI automatically asks clarifying questions if answers are brief</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={conversational}
                          onChange={(e) => setConversational(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* Ambient Noise */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Volume2 size={13} /> Ambient Background Noise Simulation
                      </label>
                      <div className="flex gap-2">
                        {[
                          { id: 'none', label: 'Silent Room' },
                          { id: 'hum', label: 'Café Murmur' },
                          { id: 'white', label: 'White Noise' },
                        ].map(n => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => setNoise(n.id)}
                            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                              noise === n.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-indigo-400'
                            }`}
                          >
                            {n.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Column: Configuration Summary Card */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Card className="p-6 flex flex-col gap-5 text-left relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Configuration</h3>
                  <span className="text-[10px] text-text-secondary block mt-0.5">{targetRole}</span>
                </div>
                <Mascot pose={pressure === 'gentle' ? 'neutral' : 'encourage'} size={44} />
              </div>

              {/* Summary Items */}
              <div className="flex flex-col gap-2.5 text-xs font-medium text-slate-600 dark:text-zinc-300">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Persona:</span>
                  <span className="font-extrabold text-slate-800 dark:text-white capitalize">{persona}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Questions:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{questionCount} Questions</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Timer Limit:</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{timeLimit}s / question</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Eye Proctoring:</span>
                  <span className={`font-extrabold ${proctoring ? 'text-emerald-500' : 'text-slate-400'}`}>{proctoring ? 'ON' : 'OFF'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Follow-ups:</span>
                  <span className={`font-extrabold ${conversational ? 'text-emerald-500' : 'text-slate-400'}`}>{conversational ? 'ON' : 'OFF'}</span>
                </div>
              </div>

              <Button
                onClick={handleSave}
                loading={saving}
                fullWidth
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Save Setup</span> <ChevronRight size={14} />
              </Button>
            </Card>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default Settings;
