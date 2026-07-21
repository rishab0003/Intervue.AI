import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import PersonaCard from '../components/PersonaCard';
import Button from '../components/Button';
import { Smile, User, Zap, Sparkles, Sliders, Target, Volume2, Eye, MessageSquare, Clock, CheckCircle2, Plus, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

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
      showToast('Applied Startup Founder preset! 💡', 'info');
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
      showToast('Settings saved successfully! 🎯', 'success');
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
    `border p-5 text-left flex flex-col justify-between gap-2.5 cursor-pointer transition-all rounded-2xl ${
      isSelected
        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm ring-1 ring-indigo-500/20'
        : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-zinc-900/60'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-dashboard-bg min-h-screen pb-24 text-left relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-8 flex flex-col gap-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
          <div>
            <div className="text-xs font-black text-text-muted uppercase tracking-[0.25em] mb-1">
              Configuration / Mock Setup
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interview Setup
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1.5 leading-relaxed">
              Customize your target role, interviewer persona, difficulty pacing, and camera proctoring.
            </p>
          </div>

          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} /> Save & Apply
          </Button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Quick Presets</span>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">Instant 1-click environment configurations</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'faang', label: 'FAANG Technical' },
              { id: 'startup', label: 'Fast Startup' },
              { id: 'hr', label: 'Behavioral HR' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Left 2 Cols, Right 1 Col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Target Role & Resume Context Card */}
            <Card className="p-6 flex flex-col gap-5 text-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Target size={18} className="text-indigo-500" />
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Target Job Role & Resume Context</h2>
                </div>
                {activeResumeMeta && (
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1 rounded-full">
                    Resume Active ✓
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Target Job Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Skill Customization</label>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>{activeResumeSkills.length > 0 ? `${activeResumeSkills.length} Skills Auto-Linked` : 'Standard General Skills'}</span>
                  </div>
                </div>
              </div>

              {/* Skill Badges Pill list */}
              {activeResumeSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeResumeSkills.map((sk, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-3 py-1 rounded-lg">
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              {/* Optional Job Description Collapsible Input */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                {!showJdInput ? (
                  <button
                    type="button"
                    onClick={() => setShowJdInput(true)}
                    className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} /> Add Specific Job Description or Requirements (Optional)
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 animate-slide-in">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <FileText size={14} /> Job Posting Text
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowJdInput(false)}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Hide
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job responsibilities or requirements here to simulate tailored interview questions..."
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-none font-medium"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Persona Selection */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.25em]">01. Interviewer Style</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Pressure & Focus Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Pressure Choice */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.25em]">02. Pressure Level</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { value: 'gentle', emoji: '🌸', label: 'Gentle', desc: 'No timer pressure, helper prompts on.' },
                    { value: 'standard', emoji: '⭐', label: 'Standard', desc: '60s per answer, standard pace.' },
                    { value: 'realistic', emoji: '🔥', label: 'Realistic', desc: '30s strict limit, intense simulation.' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setPressure(opt.value)}
                      className={selectionCardClass(pressure === opt.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{opt.label}</span>
                        </div>
                        {pressure === opt.value && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Focus */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.25em]">03. Domain Focus</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { value: 'technical', emoji: '💻', label: 'Technical & Coding', desc: 'Algorithms, system design, tech stack.' },
                    { value: 'non-technical', emoji: '💬', label: 'Behavioral & HR', desc: 'STAR framework, situational leadership.' },
                    { value: 'general', emoji: '🧩', label: 'Mixed Resume Focus', desc: 'Balanced pool tailored to your skills.' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setFocusMode(opt.value)}
                      className={selectionCardClass(focusMode === opt.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{opt.label}</span>
                        </div>
                        {focusMode === opt.value && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Advanced Controls & Summary */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Advanced System Controls */}
            <Card className="p-6 flex flex-col gap-5 text-left">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/5 pb-3.5">
                <Sliders size={18} className="text-indigo-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Advanced Controls</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Timer */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-2"><Clock size={14} /> Answer Time Limit</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{timeLimit}s</span>
                  </div>
                  <div className="py-2">
                    <input
                      type="range"
                      min="15"
                      max="120"
                      step="5"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                      className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Noise */}
                <div className="flex items-center justify-between text-xs sm:text-sm gap-2 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2"><Volume2 size={14} /> Ambient Noise</span>
                  <select
                    value={noise}
                    onChange={(e) => setNoise(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="hum">Café Hum</option>
                    <option value="white">White Noise</option>
                  </select>
                </div>

                {/* Eye Proctoring */}
                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2"><Eye size={14} /> Camera Eye Proctoring</span>
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

                {/* Follow ups */}
                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2"><MessageSquare size={14} /> AI Follow-Up Questions</span>
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
              </div>
            </Card>

            {/* Matrix & Launch Card */}
            <Card className="p-6 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Session Calibrator</h3>
                  <span className="text-xs text-text-secondary block mt-0.5">{questionCount} Questions Selected</span>
                </div>
                <Mascot pose={pressure === 'gentle' ? 'neutral' : 'encourage'} size={48} />
              </div>

              {/* Slider for Question Count */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  <span>Questions Count</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{questionCount} Qs</span>
                </div>
                <div className="py-2">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                loading={saving}
                fullWidth
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Save & Start Mock Interview →
              </Button>
            </Card>

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default Settings;
