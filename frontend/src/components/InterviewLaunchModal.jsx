import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Zap, Brain, ChevronRight, ArrowLeft, Mic, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const ROLES = [
  { value: 'Software Engineer', label: 'Software Engineer', icon: '🧑‍💻' },
  { value: 'Frontend Developer', label: 'Frontend Developer', icon: '🎨' },
  { value: 'Backend Developer', label: 'Backend Developer', icon: '⚙️' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer', icon: '🔄' },
  { value: 'Data Analyst', label: 'Data Analyst', icon: '📊' },
  { value: 'Product Manager', label: 'Product Manager', icon: '🗂️' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer', icon: '🚀' },
  { value: 'Data Scientist', label: 'Data Scientist', icon: '🤖' },
];

const PERSONAS = [
  {
    id: 'mentor',
    name: 'Friendly Mentor',
    desc: 'Warm, supportive. Encourages structured answers.',
    emoji: '👔',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/25',
    badge: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'engineer',
    name: 'Senior Engineer',
    desc: 'Direct, technical. Expects specifics and depth.',
    emoji: '🧑‍💻',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/25',
    badge: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'stress',
    name: 'Stress Mode',
    desc: 'Pushes back hard. Challenges every answer.',
    emoji: '😤',
    color: 'from-rose-500/10 to-orange-500/10 border-rose-500/25',
    badge: 'text-rose-600 dark:text-rose-400'
  }
];

export const InterviewLaunchModal = ({ isOpen, onClose }) => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  // step: 1=resume gate, 2=mode select, 3=one-on-one config
  const [step, setStep] = useState(1);
  const [hasResume, setHasResume] = useState(null); // null=checking, true, false
  const [resumeName, setResumeName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedPersona, setSelectedPersona] = useState('mentor');
  const [checking, setChecking] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen && user) {
      setStep(1);
      setSelectedRole('Software Engineer');
      setSelectedPersona('mentor');
      checkResume();
    }
  }, [isOpen]);

  const checkResume = async () => {
    if (!user) return;
    setChecking(true);
    setHasResume(null);
    try {
      // Use user.user_id (not user._id) — that's the field set by auth context
      const userId = user.user_id || user._id;
      const { data, error } = await api.getLatestResume(userId);
      if (!error && data && data.resume_id) {
        setHasResume(true);
        // Try to get a display name from parsed_json or skills
        const name = data.parsed_json?.name || data.skills?.split(',')[0] || 'Your Resume';
        setResumeName(name);
      } else {
        setHasResume(false);
      }
    } catch {
      setHasResume(false);
    } finally {
      setChecking(false);
    }
  };

  const handleStartBasic = () => {
    onClose();
    navigate('/interview?mode=basic');
  };

  const handleStartConversation = () => {
    onClose();
    const params = new URLSearchParams({ mode: 'conversation', role: selectedRole, persona: selectedPersona });
    navigate(`/interview?${params.toString()}`);
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  if (!isOpen) return null;

  const stepTitles = {
    1: '📄 Resume Check',
    2: '🎯 Choose Mode',
    3: '🧠 Configure Interview'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-black/30 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={goBack}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors mr-1 cursor-pointer"
                >
                  <ArrowLeft size={14} className="text-slate-500 dark:text-white/60" />
                </button>
              )}
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                {stepTitles[step]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={15} className="text-slate-500 dark:text-white/60" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex gap-1.5 px-6 pt-3">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`} />
            ))}
          </div>

          {/* Step Content */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Resume Gate ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">
                    Ready to practice? 🎉
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-white/50 mb-5">
                    A resume helps generate personalized questions, but you can also start right away.
                  </p>

                  {/* Loading state */}
                  {hasResume === null || checking ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400 dark:text-white/30">Checking resume...</p>
                    </div>
                  ) : hasResume ? (
                    /* ── Resume exists ── */
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-4 py-3">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">Resume Detected ✓</p>
                          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/70 mt-0.5">
                            Your latest resume will personalize the interview questions.
                          </p>
                        </div>
                        {/* Re-check button */}
                        <button onClick={checkResume} className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Re-check resume">
                          <RefreshCw size={13} />
                        </button>
                      </div>

                      {/* Primary CTA */}
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl px-5 py-3.5 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
                      >
                        Continue with Resume <ChevronRight size={16} />
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                        <span className="text-[10px] text-slate-400 dark:text-white/25 font-bold uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                      </div>

                      <button
                        onClick={() => setStep(2)}
                        className="w-full flex items-center gap-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-left hover:border-slate-400 dark:hover:border-white/20 transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Zap size={15} className="text-slate-600 dark:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-700 dark:text-white">Continue Without Resume</p>
                          <p className="text-[10px] text-slate-400 dark:text-white/30">General interview, no personalization</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 dark:group-hover:text-white transition-colors" />
                      </button>

                      <button
                        onClick={() => { onClose(); navigate('/upload'); }}
                        className="text-xs text-center text-slate-400 dark:text-white/30 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
                      >
                        Update resume →
                      </button>
                    </div>
                  ) : (
                    /* ── No resume ── */
                    <div className="flex flex-col gap-3">
                      {/* Upload option */}
                      <button
                        onClick={() => { onClose(); navigate('/upload'); }}
                        className="w-full flex items-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-2 border-indigo-200 dark:border-indigo-700/40 rounded-2xl px-4 py-4 text-left hover:border-indigo-500 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/25">
                          <Upload size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">Upload Resume First</p>
                          <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">Get personalized, role-specific questions</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </button>

                      {/* Already uploaded? Re-check */}
                      <button
                        onClick={checkResume}
                        disabled={checking}
                        className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 border border-dashed border-slate-300 dark:border-white/10 rounded-xl py-2.5 transition-colors cursor-pointer hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
                        {checking ? 'Checking...' : 'Already uploaded? Click to re-check'}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                        <span className="text-[10px] text-slate-400 dark:text-white/25 font-bold uppercase tracking-wider">or skip</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                      </div>

                      {/* Skip/continue without resume */}
                      <button
                        onClick={() => setStep(2)}
                        className="w-full flex items-center gap-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-left hover:border-slate-400 dark:hover:border-white/25 transition-all group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Zap size={16} className="text-slate-600 dark:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">Start Without Resume</p>
                          <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">General interview — no personalization</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: Mode Select ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">
                    Which mode?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-white/50 mb-5">
                    Choose your interview experience for today.
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Basic Mock */}
                    <button
                      onClick={handleStartBasic}
                      className="w-full flex items-start gap-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-700/40 rounded-2xl px-5 py-4 text-left hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Zap size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">Basic Mock</p>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full">Fresh Questions</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-white/50 leading-relaxed">AI generates a brand new set of questions every session. Classic Q&A with timer and scoring.</p>
                      </div>
                      <ChevronRight size={16} className="mt-1 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0" />
                    </button>

                    {/* One-on-One */}
                    <button
                      onClick={() => setStep(3)}
                      className="w-full flex items-start gap-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-700/40 rounded-2xl px-5 py-4 text-left hover:border-violet-400 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Brain size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">One-on-One Deep Dive</p>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded-full">New</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-white/50 leading-relaxed">Real conversation with AI. It listens, follows up, and probes your weak spots — just like a human.</p>
                      </div>
                      <ChevronRight size={16} className="mt-1 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: One-on-One Config ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">
                    Configure your interview
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-white/50 mb-5">
                    Pick your target role and how tough you want the AI to be.
                  </p>

                  {/* Role Picker */}
                  <div className="mb-4">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-white/50 mb-2 block">Target Role</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ROLES.map(r => (
                        <button
                          key={r.value}
                          onClick={() => setSelectedRole(r.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${
                            selectedRole === r.value
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                              : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:border-indigo-400 dark:hover:border-indigo-500'
                          }`}
                        >
                          <span className="text-base">{r.icon}</span>
                          <span className="truncate">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Persona Picker */}
                  <div className="mb-5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-white/50 mb-2 block">Interviewer Persona</label>
                    <div className="flex flex-col gap-2">
                      {PERSONAS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPersona(p.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer border bg-gradient-to-br ${p.color} ${
                            selectedPersona === p.id ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-transparent' : 'hover:opacity-80'
                          }`}
                        >
                          <span className="text-xl">{p.emoji}</span>
                          <div>
                            <p className={`text-xs font-extrabold ${p.badge}`}>{p.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/40">{p.desc}</p>
                          </div>
                          {selectedPersona === p.id && <CheckCircle2 size={15} className="ml-auto text-indigo-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStartConversation}
                    className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl px-5 py-3.5 flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/20 cursor-pointer"
                  >
                    <Mic size={15} />
                    Start One-on-One Interview
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewLaunchModal;
