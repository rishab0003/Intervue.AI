import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Check,
  ChevronRight,
  Video,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  Star,
  Quote,
  Upload,
  Sliders,
  Mic,
  Sun,
  Moon,
  Users,
  Terminal,
  FileText,
  Eye,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useInView, motion, AnimatePresence } from 'framer-motion';


// Count-up helper specifically for the trust/statistics strip
const Counter = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value.replace(/[^0-9]/g, '')) || 100;
      if (start === end) return;
      const duration = 2000;
      const incrementTime = Math.abs(Math.floor(duration / end));
      
      const timer = setInterval(() => {
        start += Math.ceil(end / 40);
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, Math.max(incrementTime, 30));
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  const getDisplayValue = () => {
    if (value.includes('+')) return `${count.toLocaleString()}+`;
    if (value.includes('%')) return `${count}%`;
    if (value.includes('★')) return `${(count / 10).toFixed(1)}★`;
    return count;
  };


    return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-bold-display">
        {isInView ? getDisplayValue() : '0'}
      </span>
      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center max-w-[160px]">
        {label}
      </span>
    </div>
  );
};
// FAQ accordion item helper
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-white/10 py-5 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-sm md:text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white py-3 hover:opacity-85 cursor-pointer"
      >
        <span>{question}</span>
        <ChevronRight size={14} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
// Technical Comparison Matrix (Option 3)
const ComparisonMatrix = () => {
  const [activeSide, setActiveSide] = useState('intervue');
  const points = [
    {
      feature: "Voice Stream Latency",
      intervue: { text: "~100ms real-time stream", desc: "WebSocket connection for instantaneous vocal response, no lag", active: true },
      traditional: { text: "3s - 5s text-to-speech delay", desc: "Heavy conversational latency, breaks normal human pacing", active: false }
    },
    {
      feature: "Question Context",
      intervue: { text: "Dynamic Resume Parsing", desc: "Syllabus custom-compiled from your actual PDF projects & skills", active: true },
      traditional: { text: "Static Questionnaire templates", desc: "Generic hardcoded loops built for no one in particular", active: false }
    },
    {
      feature: "Presence & Proctoring",
      intervue: { text: "Local Eye Gaze Telemetry", desc: "MediaPipe logs alignment client-side, alerts when looking away", active: true },
      traditional: { text: "Simple Video upload", desc: "Uploads raw video to server with zero active feedback", active: false }
    },
    {
      feature: "Evaluation Depth",
      intervue: { text: "STAR Method scoring", desc: "Breaks performance down question-by-question with direct tips", active: true },
      traditional: { text: "Generic summary text", desc: "Provides single paragraph of general feedback for the session", active: false }
    },
    {
      feature: "Data Privacy",
      intervue: { text: "On-Device Processing", desc: "Webcam coordinates run locally, coordinates are instantly purged", active: true },
      traditional: { text: "Permanent Cloud storage", desc: "Recordings stored on external cloud databases, high exposure", active: false }
    }
  ];
  return (
    <div className="w-full mt-12 bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-lg select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
        <div className="text-left">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Comparative Audit</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-bold-display mt-1">
            HOW WE STACK UP.
          </h3>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden w-full bg-slate-100 dark:bg-black/30 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setActiveSide('intervue')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${activeSide === 'intervue' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-500 dark:text-slate-450'}`}
          >
            Intervue.ai
          </button>
          <button 
            type="button"
            onClick={() => setActiveSide('traditional')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${activeSide === 'traditional' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-500 dark:text-slate-450'}`}
          >
            Traditional prep
          </button>
        </div>
      </div>
      <div className="hidden md:grid grid-cols-12 gap-4 items-center border-b border-slate-900/10 dark:border-white/5 pb-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
        <div className="col-span-4 text-left">Audit Parameters</div>
        <div className="col-span-4 text-left text-indigo-500">Intervue.ai (Next-Gen)</div>
        <div className="col-span-4 text-left text-slate-400 dark:text-slate-500">Traditional Prep</div>
      </div>
      {/* Grid Comparison */}
      <div className="flex flex-col gap-6">
        {points.map((pt, idx) => (
          <div 
            key={idx} 
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-100 dark:border-white/5 pb-5 last:border-none last:pb-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] hover:translate-x-1 rounded-2xl transition-all duration-300 px-3 -mx-3 group"
          >
            {/* Feature Label */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform shrink-0" />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider text-left group-hover:text-indigo-500 transition-colors">{pt.feature}</span>
            </div>
                         {/* Columns */}
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Intervue Side */}
              <div className={`items-start gap-3 transition-all duration-300 ${activeSide !== 'intervue' ? 'hidden md:flex opacity-60 md:opacity-100 group-hover:scale-[1.02]' : 'flex'}`}>
                <div className="relative shrink-0 mt-0.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                  <span className="relative w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 flex items-center justify-center text-xs font-bold border border-emerald-500/35">✓</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-tight">{pt.intervue.text}</span>
                  <span className="text-[10px] text-slate-550 dark:text-slate-400 mt-1 block leading-relaxed font-semibold">{pt.intervue.desc}</span>
                </div>
              </div>
              {/* Traditional Side */}
              <div className={`items-start gap-3 transition-all duration-300 ${activeSide !== 'traditional' ? 'hidden md:flex opacity-45' : 'flex'}`}>
                <span className="w-5 h-5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500/70 flex items-center justify-center text-xs font-bold border border-rose-500/20 shrink-0 mt-0.5">✗</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-600 block uppercase tracking-tight line-through decoration-slate-450/40">{pt.traditional.text}</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-550 mt-1 block leading-relaxed font-semibold">{pt.traditional.desc}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export const Landing = () => {
  const { darkMode, toggleDarkMode, showToast } = useApp();
  const [showMore, setShowMore] = useState(false);
  const categories = [
    { num: '01', title: 'HR & Behavioral', border: 'border-t-indigo-600', text: 'text-indigo-600', bg: 'hover:shadow-indigo-500/10' },
    { num: '02', title: 'Technical Rounds', border: 'border-t-coral', text: 'text-accent', bg: 'hover:shadow-accent/10' },
    { num: '03', title: 'Resume Deep-Dive', border: 'border-t-teal-600', text: 'text-teal-600', bg: 'hover:shadow-teal-500/10' },
    { num: '04', title: 'Group Discussion', border: 'border-t-blue-600', text: 'text-blue-600', bg: 'hover:shadow-blue-500/10' },
    { num: '05', title: 'Body Language', border: 'border-t-success', text: 'text-success', bg: 'hover:shadow-success/10' },
    { num: '06', title: 'Speaking Pace', border: 'border-t-focus-area', text: 'text-focus-area', bg: 'hover:shadow-focus-area/10' }
  ];
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen bg-landing-base flex flex-col justify-between overflow-x-hidden select-none relative transition-colors">
      {/* 1st Section Background (Login page background clone) */}
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-[800px] md:h-[900px] overflow-hidden z-0">
        {/* Dotted-grid mask */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: darkMode
              ? "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)"
              : "radial-gradient(rgba(15,23,42,0.05) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 55%, transparent 100%)",
          }}
        />
        {/* Style tag for keyframes */}
        <style>{`
          @keyframes float-slow-1 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(60px, -80px) scale(1.15); }
            66% { transform: translate(-40px, 40px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes float-slow-2 {
            0% { transform: translate(0px, 0px) scale(1.1); }
            50% { transform: translate(-70px, 50px) scale(0.85); }
            100% { transform: translate(0px, 0px) scale(1.1); }
          }
          @keyframes float-slow-3 {
            0% { transform: translate(0px, 0px) scale(0.95); }
            50% { transform: translate(50px, 60px) scale(1.1); }
            100% { transform: translate(0px, 0px) scale(0.95); }
          }
        `}</style>
        {/* Auras */}
        <div className="absolute left-[-15%] top-[-10%] h-[520px] w-[520px] bg-indigo-500/10 dark:bg-indigo-600/40" style={{ filter: 'blur(120px)', borderRadius: '9999px', position: 'absolute', animation: 'float-slow-1 25s infinite ease-in-out' }} />
        <div
          className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] bg-emerald-500/10 dark:bg-emerald-500/25"
          style={{ animation: 'float-slow-2 30s infinite ease-in-out', filter: 'blur(120px)', borderRadius: '9999px', position: 'absolute' }}
        />
        <div
          className="absolute left-[35%] bottom-[10%] h-[420px] w-[420px] bg-amber-400/5 dark:bg-amber-400/15"
          style={{ animation: 'float-slow-3 22s infinite ease-in-out', filter: 'blur(100px)', borderRadius: '9999px', position: 'absolute' }}
        />
      </div>
      
      {/* 1. Nav Bar capsule */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-10 pt-5 relative z-50">
        <div className="bg-[#FAFAF7]/95 dark:bg-[#0A0E1A]/85 backdrop-blur-md rounded-full border border-slate-900/5 dark:border-white/10 shadow-lg px-6 h-14 flex justify-between items-center transition-all">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
            <span className="font-extrabold text-sm tracking-tight text-slate-950 dark:text-white font-bold-display">
              intervue<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
            </span>
          </div>
          {/* Middle Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#/landing" onClick={(e) => handleScrollTo(e, 'features')} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors">Features</a>
            <a href="#/landing" onClick={(e) => handleScrollTo(e, 'categories')} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors">Practice Tracks</a>
            <a href="#/landing" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#/landing" onClick={(e) => handleScrollTo(e, 'manifesto')} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors">Our Story</a>
            <a href="#/landing" onClick={(e) => handleScrollTo(e, 'faq')} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors">FAQs</a>
          </nav>
          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Switch */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-slate-500" />}
            </button>
            <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors pr-1">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-slate-950 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 font-black rounded-full px-6 py-2.5 text-xs uppercase tracking-wider shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 border border-slate-900/10 dark:border-white/10"
            >
              <span>Start free</span>
              <ArrowRight size={10} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </header>
      {/* 2. Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 relative z-10 text-left">
        <div className="flex-1 flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            • PRIVATE BETA
          </span>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-950 dark:text-white leading-[0.95] tracking-tighter font-bold-display uppercase">
            SPEAK <br />
            YOUR WAY <br />
            INTO THE <br />
            <span className="font-serif italic lowercase text-blue-600 dark:text-indigo-400 font-normal">room.</span>
          </h1>
          <p className="text-slate-650 dark:text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed font-medium">
            Unlimited, hyper-realistic voice-to-voice mock interviews that dynamically adapt to your resume and target career path. Powered by Gemini Live API — ultra-low latency, real conversation, real pressure.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2">
            <Link
              to="/register"
              className="bg-slate-950 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 font-black rounded-full px-8 py-3.5 text-sm tracking-wider uppercase shadow-md hover:scale-105 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-1.5 border border-slate-900/10 dark:border-white/10"
            >
              <span>Start your first session</span>
              <ArrowRight size={12} strokeWidth={3} />
            </Link>
            <button
              onClick={() => showToast("Added to waitlist! 🚀", "success")}
              className="bg-transparent text-slate-800 dark:text-white font-black rounded-full px-8 py-3.5 text-sm tracking-wider uppercase border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all w-full sm:w-auto text-center cursor-pointer"
            >
              Join the waitlist
            </button>
          </div>
        </div>
        {/* Right side - interactive demo walkthrough */}
        <div className="flex-1 hidden md:flex justify-center relative z-10 w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
          <motion.div
            initial={{ rotate: -2, scale: 0.95, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-2xl bg-white dark:bg-[#090C16] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Interactive State Handler */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes liveWave {
                0%, 100% { height: 8px; }
                50% { height: 32px; }
              }
              .wave-bar {
                animation: liveWave 0.5s ease-in-out infinite;
              }
            `}} />

             {/* Step Selection Hook */}
            {(() => {
              const [activeStep, setActiveStep] = useState(0);
              const steps = [
                { id: 0, label: '01. Dashboard' },
                { id: 1, label: '02. CV Parser' },
                { id: 2, label: '03. Setup Lobby' },
                { id: 3, label: '04. Arena' },
                { id: 4, label: '05. History' }
              ];
              useEffect(() => {
                const interval = setInterval(() => {
                  setActiveStep((prev) => (prev + 1) % 5);
                }, 2500);
                return () => clearInterval(interval);
              }, []);
              return (
                <>
                  {/* Simulated Browser Title Bar */}
                  <div className="bg-slate-100/80 dark:bg-black/30 px-5 py-3.5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400/60 font-mono">
                      intervue.ai • interactive tour
                    </span>
                    <span className="text-[9px] font-extrabold text-blue-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      LIVE DEMO
                    </span>
                  </div>
                  {/* Walkthrough Content Container */}
                  <div className="p-6 h-[340px] flex flex-col justify-between select-none">
                    
                    {/* STEP 1: Starting Dashboard */}
                    {activeStep === 0 && (
                      <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Student Command Center</h4>
                          <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Active Streak: 6 Days</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-3 rounded-2xl">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Sessions Done</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">18</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-3 rounded-2xl">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Avg Score</span>
                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">8.2 / 10</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-3 rounded-2xl">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Filler Words</span>
                            <span className="text-xl font-black text-rose-500 mt-1 block">2.4 / min</span>
                          </div>
                        </div>
                        {/* Mock Graph */}
                        <div className="flex-1 bg-slate-50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Score Performance Trend</span>
                          <div className="h-16 flex items-end justify-between gap-1 mt-2">
                            {[45, 60, 52, 70, 85, 82, 95].map((h, i) => (
                               <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                 <div className="w-full bg-indigo-500/20 dark:bg-indigo-500/10 rounded-t" style={{ height: `${h}%` }}>
                                   <div className="w-full bg-indigo-500 rounded-t transition-all duration-500" style={{ height: '30%' }} />
                                 </div>
                                 <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500">S0{i+1}</span>
                               </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* STEP 2: Resume Parsing */}
                    {activeStep === 1 && (
                      <div className="flex-1 flex flex-col gap-4 justify-center animate-[fadeIn_0.2s_ease-out]">
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Context-Aware Resume Manager</h4>
                        <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-black/10">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                            <FileText size={20} className="animate-bounce" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight block">Rishab_Resume_SWE.pdf</span>
                            <span className="text-xs font-semibold text-slate-500 mt-1 block">428 KB • PDF Format</span>
                          </div>
                          {/* Simulated Loading bar */}
                          <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[88%] animate-[pulse_1.5s_infinite]" />
                          </div>
                          <span className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-widest">Parsing profile context (88% done)</span>
                        </div>
                      </div>
                    )}
                    {/* STEP 3: Interview Settings */}
                    {activeStep === 2 && (
                      <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Pre-Interview Lobby Setup</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-1.5 text-left">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Persona</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Strict Recruiter</span>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">Simulates intense technical panel reviews.</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-1.5 text-left">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Focus Round</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Technical Systems</span>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">Targets API throughput, databases, and scale.</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-1.5 text-left col-span-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Camera Proctoring Mode</span>
                              <span className="w-8 h-4 bg-indigo-500 rounded-full p-0.5 cursor-pointer flex justify-end"><span className="w-3 h-3 bg-white rounded-full" /></span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Enables real-time client-side gaze tracking checks.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* STEP 4: Live Interview Arena */}
                    {activeStep === 3 && (
                      <div className="flex-1 flex flex-col gap-3.5 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> REC • LIVE ARENA
                          </span>
                          <span className="text-[11px] font-black text-slate-500 font-mono">00:04:12 • 48KHZ</span>
                        </div>
                        {/* Audio Wave-form visual */}
                        <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative min-h-[140px]">
                          {/* Backlighting */}
                          <div className="absolute inset-0 bg-indigo-500/10 blur-xl pointer-events-none" />
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">AI Voice Channel</span>
                            <span className="text-[11px] font-black text-indigo-400 font-mono">118 WPM</span>
                          </div>
                          
                          {/* Centered Waveform bars */}
                          <div className="flex items-center justify-center gap-1 h-12 my-2 relative z-10">
                            {[1.2, 0.6, 1.8, 0.4, 2.2, 1.0, 1.5, 0.5, 2.0, 0.8, 1.4].map((delay, idx) => (
                              <span 
                                key={idx} 
                                className="w-1 rounded-full bg-indigo-400 wave-bar" 
                                style={{ animationDelay: `${delay}s`, height: '14px' }} 
                              />
                            ))}
                          </div>
                          <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 relative z-10 text-left">
                            <p className="text-xs text-white leading-relaxed font-semibold">
                              <span className="text-indigo-400 font-black">AI Interviewer:</span> "How would you design a rate limiter for 10K requests/sec?"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* STEP 5: Results & History */}
                    {activeStep === 4 && (
                      <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Recent Sessions History</h4>
                        <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-150 dark:border-white/5 bg-slate-100/50 dark:bg-black/20">
                                <th className="p-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialization</th>
                                <th className="p-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus Mode</th>
                                <th className="p-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                                <th className="p-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-150 dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <td className="p-2.5 uppercase font-bold">Frontend Engineer</td>
                                <td className="p-2.5 uppercase">Technical</td>
                                <td className="p-2.5 text-emerald-500 font-black">9.0 / 10</td>
                                <td className="p-2.5"><span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">PASSED</span></td>
                              </tr>
                              <tr className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <td className="p-2.5 uppercase font-bold">System Designer</td>
                                <td className="p-2.5 uppercase">Architectural</td>
                                <td className="p-2.5 text-indigo-500 font-black">8.4 / 10</td>
                                <td className="p-2.5"><span className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">REVIEWED</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
                          All mock feedback is saved to your account. Access full question breakdowns at any time.
                        </p>
                      </div>
                    )}
                    {/* Navigation Tabs bar */}
                    <div className="border-t border-slate-150 dark:border-white/5 pt-4 flex gap-1 justify-between">
                      {steps.map((step) => (
                        <button
                          key={step.id}
                          onClick={() => setActiveStep(step.id)}
                          className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all duration-300 ${
                            activeStep === step.id
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                              : 'bg-slate-50 dark:bg-white/[0.02] text-slate-450 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {step.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      </main>
      {/* 3. Trust/Stat Strip */}
      <section className="bg-slate-100/60 dark:bg-[#080B14] border-y border-slate-200 dark:border-white/10 py-10 w-full relative z-10 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4 overflow-hidden">
        <Counter value="3+" label="AI Interview Modes" />
        <Counter value="100%" label="On-Device Proctoring" />
        <Counter value="6+" label="Practice Tracks" />
        <Counter value="48" label="KHz Audio Capture" />
      </section>
      {/* 3.1. Infinite Scrolling Marquee Ticker */}
      <div className="w-full bg-[#F8F8F5] dark:bg-[#06080F] border-b border-slate-200 dark:border-white/5 py-8 overflow-hidden relative z-10 select-none">
        <div className="flex animate-marquee whitespace-nowrap text-4xl md:text-6xl font-black text-slate-900/5 dark:text-white/5 uppercase tracking-tighter font-bold-display">
          <span>Friendly Coach &nbsp;•&nbsp; Strict Examiner &nbsp;•&nbsp; Technical Focus &nbsp;•&nbsp; Non-Technical Behavioral &nbsp;•&nbsp; Realistic Pressure &nbsp;•&nbsp; Resume-Aware AI &nbsp;•&nbsp; Gaze Proctoring &nbsp;•&nbsp; Waveform Capture &nbsp;•&nbsp;&nbsp;</span>
          <span>Friendly Coach &nbsp;•&nbsp; Strict Examiner &nbsp;•&nbsp; Technical Focus &nbsp;•&nbsp; Non-Technical Behavioral &nbsp;•&nbsp; Realistic Pressure &nbsp;•&nbsp; Resume-Aware AI &nbsp;•&nbsp; Gaze Proctoring &nbsp;•&nbsp; Waveform Capture &nbsp;•&nbsp;&nbsp;</span>
        </div>
      </div>
      {/* NEW: Features Deep-Dive Section */}
      <section id="features" className="bg-landing-base py-24 w-full relative z-10 text-left border-b border-slate-200 dark:border-white/5 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-3 mb-16"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-widest px-3 py-1 rounded-full">
              <Sparkles size={10} /> Core Architecture
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-bold-display uppercase leading-tight">
              BUILT TO FEEL<br/>LIKE THE REAL THING.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl mt-1 leading-relaxed">
              Traditional tools fail to simulate real-time pressure. Intervue uses a live bidirectional audio stream — so every session feels like talking to an actual interviewer, not a chatbot.

                  </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic size={22} />,
                label: '01',
                title: 'Gemini Live Voice AI',
                desc: 'The core engine uses WebSockets for a bidirectional audio stream with Gemini. Ultra-low latency, natural interruptions, and conversational realism that feels like talking to a real human interviewer.',
                accent: '#6366F1',
                accentLight: 'rgba(99,102,241,0.12)',
                tag: 'Real-time voice'
              },
              {
                icon: <FileText size={22} />,
                label: '02',
                title: 'Resume-Aware Questions',
                desc: 'Upload your PDF resume and the AI parses your experience, skills, and target role. Every question is tailored to your profile — no generic templates, ever.',
                accent: '#10B981',
                accentLight: 'rgba(16,185,129,0.12)',
                tag: 'Context-aware'
              },
              {
                icon: <Activity size={22} />,
                label: '03',
                title: 'Live Telemetry & Proctoring',
                desc: 'Real-time speech pace (WPM), audio amplitude visualization, and MediaPipe gaze tracking run locally. Comprehensive post-session feedback breaks performance down question-by-question.',
                accent: '#F59E0B',
                accentLight: 'rgba(245,158,11,0.12)',
                tag: 'On-device analytics'
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-[#F3F2ED]/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-7 flex flex-col gap-5 text-left cursor-default overflow-hidden"
                style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px ${card.accentLight}, 0 4px 20px rgba(0,0,0,0.08)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.04)'}
              >
                            {/* Hover spotlight glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${card.accentLight} 0%, transparent 70%)` }} />
                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }} />
                {/* Card number */}
                <div className="absolute top-5 right-6 text-[10px] font-black text-slate-400/30 dark:text-white/15 group-hover:text-slate-500/60 transition-colors duration-300 tracking-wider">
                  {card.label}
                </div>
                {/* Icon */}
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: card.accentLight, color: card.accent }}>
                  {card.icon}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 20px ${card.accent}40` }} />
                </div>
              {/* Tag pill */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ color: card.accent, background: card.accentLight, borderColor: `${card.accent}30` }}>
                    {card.tag}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white uppercase tracking-tight font-bold-display leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Bottom feature highlight row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="w-full"
          >
            <ComparisonMatrix />
          </motion.div>
        </div>
      </section>
      {/* 4. "What we help with" Bento Grid (Curriculum) */}
      <section id="categories" className="bg-landing-sec dark:bg-[#070A13] border-b border-slate-200 dark:border-white/5 py-24 w-full relative z-10 text-left overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative"
          >
            {/* Background absolute title marker */}
            <div className="absolute -right-6 -bottom-12 text-[130px] font-black text-slate-900/[0.01] dark:text-white/[0.02] tracking-tighter select-none pointer-events-none font-bold-display">
              02
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
                §02 · CURRICULUM
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter font-bold-display uppercase mt-2">
                What we <span className="font-serif italic lowercase text-blue-600 dark:text-indigo-400 font-normal">help with.</span>
              </h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md leading-relaxed relative z-10 font-medium">
              Six focused practice tracks. Each one a small, private stage where you rehearse until the answer feels like memory instead of math.
            </p>
          </motion.div>
          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {/* Tile 1 — Large Hero (spans 4 cols on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="sm:col-span-4 relative rounded-2xl overflow-hidden cursor-default group p-6 flex flex-col justify-between min-h-[220px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 01</span>
                <span className="p-2 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/15">
                  <Users size={16} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">HR & Behavioral</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md font-medium">
                  STAR-mode drills, values probes, and calm answers to the awkward questions everyone dodges. Rehearse situational leadership, conflict management, and growth mindsets.
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 01</span>
                <Link to="/register" className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-305 transition-colors uppercase flex items-center gap-1">
                  OPEN TRACK <ArrowRight size={8} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
            {/* Tile 2 — Medium (spans 2 cols on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="sm:col-span-2 relative rounded-2xl overflow-hidden cursor-default group p-6 flex flex-col justify-between min-h-[220px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 02</span>
                <span className="p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/15">
                  <Terminal size={16} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">Tech Rounds</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  Systems, DSA, and think-out-loud fluency. Time-boxed with silence coaching.
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 02</span>
                <Link to="/register" className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-305 transition-colors uppercase flex items-center gap-1">
                  OPEN TRACK <ArrowRight size={8} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
            {/* Tile 3 — Spans 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              whileHover={{ y: -4 }}
              className="sm:col-span-2 relative rounded-2xl overflow-hidden cursor-default group p-6 flex flex-col justify-between min-h-[200px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 03</span>
                <span className="p-2 rounded-xl bg-teal-500/5 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10 dark:border-teal-500/15">
                  <FileText size={16} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">Resume Deep-Dive</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  AI parses your CV and drills experience — projects, gaps, and skills.
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 03</span>
                <Link to="/register" className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-305 transition-colors uppercase flex items-center gap-1">
                  OPEN TRACK <ArrowRight size={8} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
            {/* Tile 4 — Spans 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="sm:col-span-2 relative rounded-2xl overflow-hidden cursor-default group p-6 flex flex-col justify-between min-h-[200px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 04</span>
                <span className="p-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 dark:border-blue-500/15">
                  <MessageSquare size={16} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">Group Discussion</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  Practice debate moderation, argument structuring, and turns in panel settings.
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 04</span>
                <Link to="/register" className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-305 transition-colors uppercase flex items-center gap-1">
                  OPEN TRACK <ArrowRight size={8} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
            {/* Tile 5 — Spans 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              whileHover={{ y: -4 }}
              className="sm:col-span-2 relative rounded-2xl overflow-hidden cursor-default group p-6 flex flex-col justify-between min-h-[200px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 05</span>
                <span className="p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/15">
                  <Eye size={16} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">Body Language</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  Real-time gaze tracking, head-tilt warnings, and posture scores.
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 05</span>
                <Link to="/register" className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-305 transition-colors uppercase flex items-center gap-1">
                  OPEN TRACK <ArrowRight size={8} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
            {/* Tile 6 — Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="sm:col-span-6 relative rounded-3xl overflow-hidden cursor-default group p-8 flex flex-col justify-between min-h-[200px] bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors animate-none"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">CHAPTER 06</span>
                <span className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 dark:border-amber-500/15">
                  <Activity size={20} />
                </span>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">Voice Pacing</h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl font-medium">
                    Fillers, pauses, and cadence — measured in ms. We surface the shape of your voice, honestly. Monitor confidence registers and WPM pacing variables.
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-6 mt-8">
                <span className="text-sm font-black tracking-widest text-slate-400 dark:text-slate-500">TRACK 06</span>
                <Link to="/register" className="text-sm font-black tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase flex items-center gap-2">
                  OPEN TRACK <ArrowRight size={12} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* 5. How It Works */}
      <section id="how-it-works" className="bg-landing-base py-24 w-full relative z-10 text-left border-b border-slate-200/60 dark:border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full relative">
          <div className="flex flex-col items-start gap-2 mb-16">
            <span className="text-xs font-extrabold text-blue-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
              🚀 Pipeline Sequence
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-bold-display uppercase">
              HOW IT WORKS.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl mt-1 leading-relaxed font-medium">
              From resume upload to AI-powered live interview to a full breakdown of your performance — in three straightforward steps.
            </p>
          </div>
          {/* Timeline Wrapper */}
          <div className="relative">
            {/* Timeline connector lines are now inside individual steps for perfect joining */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col items-center md:items-start text-center md:text-left gap-4"
              >
                {/* Connector Line to Step 2 */}
                <div className="hidden md:block absolute top-[40px] left-[40px] w-[calc(100%+2.5rem)] h-[2px] pointer-events-none z-0 overflow-hidden">
                  <svg width="100%" height="2" className="absolute top-0 left-0">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="text-indigo-300/50 dark:text-indigo-500/50 animate-marching-ants" />
                  </svg>
                </div>
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-indigo-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-500 group-hover:shadow-indigo-100">
                  <Upload size={32} className="text-indigo-600 group-hover:rotate-3 transition-transform" />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                    CV Parsing
                  </span>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase tracking-tighter font-bold-display mt-1">
                    STEP 1
                  </h3>
                  <h4 className="font-extrabold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Upload Your Resume
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xs mt-2">
                    Drop your PDF resume into the Resume Manager. The backend parses your experience, skills, and target role — giving the AI full context before a single question is asked.
                  </p>
                </div>
              </motion.div>
              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="group relative flex flex-col items-center md:items-start text-center md:text-left gap-4"
              >
                {/* Connector Line to Step 3 */}
                <div className="hidden md:block absolute top-[40px] left-[40px] w-[calc(100%+2.5rem)] h-[2px] pointer-events-none z-0 overflow-hidden">
                  <svg width="100%" height="2" className="absolute top-0 left-0">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="text-indigo-300/50 dark:text-indigo-500/50 animate-marching-ants" />
                  </svg>
                </div>
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-emerald-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500 group-hover:shadow-emerald-100">
                  <Sliders size={32} className="text-emerald-600 group-hover:-rotate-3 transition-transform" />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                    Telemetry
                  </span>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase tracking-tighter font-bold-display mt-1">
                    STEP 2
                  </h3>
                  <h4 className="font-extrabold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Configure & Calibrate
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xs mt-2">
                    In the Setup lobby, pick your AI Persona (Friendly Mentor vs. Strict Recruiter), set difficulty and focus mode (Technical / Behavioral), and toggle Camera Proctoring before you begin.
                  </p>
                </div>
              </motion.div>
              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="group relative flex flex-col items-center md:items-start text-center md:text-left gap-4"
              >
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-amber-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-amber-500 group-hover:shadow-amber-100">
                  <Mic size={32} className="text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                    AI Assessment
                  </span>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase tracking-tighter font-bold-display mt-1">
                    STEP 3
                  </h3>
                  <h4 className="font-extrabold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Speak, Then Review
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xs mt-2">
                    Speak naturally via the live WebSocket arena. After your session, the Feedback Engine grades every answer individually — scoring technical accuracy, delivery, and STAR method usage.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* NEW: Testimonials Grid Section */}
      <section className="bg-landing-sec dark:bg-[#070A13] py-20 w-full relative z-10 text-left border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-2 mb-12"
          >
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">SUCCESS STORIES</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-bold-display uppercase">
              STUDENT TESTIMONIALS.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col gap-5 text-left shadow-md relative"
            >
              <Quote size={22} className="text-landing-accent absolute top-6 right-6 opacity-30" />
              <div className="flex gap-1 text-focus-area"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
                "Intervue AI completely changed how I prep. The eye-gaze tracking showed I looked away when explaining complex SQL indexing. Fixing that simple habit got me my Software Engineer offer!"
              </p>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Rishab S. <span className="text-slate-500 font-medium text-slate-600">— Software Engineering Grad</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col gap-5 text-left shadow-md relative"
            >
              <Quote size={22} className="text-landing-accent absolute top-6 right-6 opacity-30" />
              <div className="flex gap-1 text-focus-area"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
                "The conversational follow-up questions felt exactly like my actual HR rounds. Practicing in this calm environment kept me from freezing during the pressure-limit challenges."
              </p>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Sarah J. <span className="text-slate-500 font-medium text-slate-600">— Product Manager Candidate</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* NEW: Manifesto Section */}
      <section id="manifesto" className="bg-landing-base dark:bg-[#070A13] py-28 w-full relative z-10 text-left border-b border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-10 w-full relative">
          
          {/* Background absolute title marker */}
          <div className="absolute -left-10 -bottom-16 text-[150px] font-black text-slate-900/[0.01] dark:text-white/[0.02] tracking-tighter select-none pointer-events-none font-bold-display">
            03
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 max-w-4xl relative z-10"
          >
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
              §03 · MANIFESTO
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-bold-display">
              Interviews are a high-anxiety <br />bottleneck — <br />
              <span className="font-serif italic lowercase text-blue-600 dark:text-blue-400 font-normal">we built the antidote.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
              For many students and job seekers, the problem isn't knowledge — it's structuring thoughts under pressure. Traditional solutions rely on expensive human coaching or static AI tools that fail to simulate real-time conversational pacing. Intervue solves this with unlimited, hyper-realistic voice-to-voice mock interviews that adapt to you.
            </p>
          </motion.div>
          {/* Right Column is empty to let the Canvas shine through */}
          <div className="hidden md:block md:w-1/2"></div>
        </div>
      </section>
      {/* NEW: FAQ Accordion Section */}
      <section id="faq" className="bg-landing-sec dark:bg-[#0A0E1A] py-20 w-full relative z-10 text-left border-b border-slate-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2 mb-12 text-center"
          >
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400/60 uppercase tracking-widest flex items-center gap-1"><HelpCircle size={11} /> Help center</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-bold-display uppercase">
              FREQUENTLY ASKED.
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex flex-col"
          >
            <FAQItem
              question="How does the voice interview work?"
              answer="The core engine uses Gemini Live API over WebSockets to maintain a real-time bidirectional audio stream. This allows ultra-low latency, natural back-and-forth conversation, and realistic interruptions — making it feel like talking to an actual human interviewer."
            />
            <FAQItem
              question="How does the AI know what to ask me?"
              answer="You upload your PDF resume via the Resume Manager. The backend parses your experience, projects, and target role, then combines it with your chosen interview settings (focus mode, difficulty, AI persona) to generate personalized, context-aware questions every session."
            />
            <FAQItem
              question="Is my video or audio data stored on your servers?"
              answer="No. Camera gaze tracking runs entirely on-device using MediaPipe Face Mesh — your video never leaves the browser. Audio is only processed in real-time by the Gemini Live API and is not persistently stored."
            />
            <FAQItem
              question="Can I customize the interview experience?"
              answer="Yes. In the Setup & Configuration lobby you can pick your AI Persona (Friendly Mentor vs. Strict Recruiter), set the difficulty level, choose a focus mode (Technical or Behavioral), and toggle Blind Mode or Camera Proctoring before starting."
            />
            <FAQItem
              question="How are my answers scored?"
              answer="After each session, the Feedback Engine evaluates your overall performance and provides a question-by-question breakdown — grading technical accuracy, behavioral delivery, and highlighting missed opportunities like the STAR method."
            />
          </motion.div>
        </div>
      </section>
      {/* 6. Footer system */}
      <footer className="bg-white dark:bg-[#070A13] border-t border-slate-900 dark:border-white/10 w-full relative z-10 text-left text-slate-400 select-none overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full relative z-10">
          
          {/* Top Grid Boxes (Brutalist style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-900 dark:border-white/10 -mx-6 md:-mx-10">
            <a 
              href="#/landing" 
              onClick={(e) => handleScrollTo(e, 'features')} 
              className="py-12 px-6 border-b md:border-b-0 md:border-r border-slate-900 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all text-center group cursor-pointer"
            >
              <span className="text-[9px] font-black text-slate-400 dark:text-white/30 tracking-widest uppercase block mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">01 / CAPABILITIES</span>
              <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-bold-display">FEATURES</span>
            </a>
            <a 
              href="#/landing" 
              onClick={(e) => handleScrollTo(e, 'categories')} 
              className="py-12 px-6 border-b md:border-b-0 md:border-r border-slate-900 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all text-center group cursor-pointer"
            >
              <span className="text-[9px] font-black text-slate-400 dark:text-white/30 tracking-widest uppercase block mb-1 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">02 / INTERVIEW</span>
              <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-bold-display">PRACTICE TRACKS</span>
            </a>
            <a 
              href="#/landing" 
              onClick={(e) => handleScrollTo(e, 'manifesto')} 
              className="py-12 px-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all text-center group cursor-pointer"
            >
              <span className="text-[9px] font-black text-slate-400 dark:text-white/30 tracking-widest uppercase block mb-1 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">03 / MANIFESTO</span>
              <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-bold-display">OUR STORY</span>
            </a>
          </div>
          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-16 border-b border-slate-900/10 dark:border-white/5 relative z-10">
            
            {/* Left side: Brand info */}
            <div className="md:col-span-6 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md" />
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-bold-display uppercase">
                  intervue<span className="text-indigo-600 dark:text-indigo-400 font-bold-display">.ai</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-550 leading-relaxed max-w-sm font-medium">
                Voice-to-voice AI mock interviews powered by Gemini Live API. Unlimited practice, resume-aware questions, and on-device telemetry — so you walk in ready.
              </p>
            </div>
            {/* Right side: simplified link directory */}
            <div className="md:col-span-6 grid grid-cols-2 gap-8 md:justify-items-end">
              <div className="flex flex-col gap-3.5 text-xs text-left">
                <span className="font-extrabold text-[10px] text-slate-400 dark:text-white/40 tracking-widest uppercase mb-1">PLATFORM</span>
                <a href="#/landing" onClick={(e) => handleScrollTo(e, 'features')} className="text-slate-650 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wider cursor-pointer">Features</a>
                <a href="#/landing" onClick={(e) => handleScrollTo(e, 'categories')} className="text-slate-650 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wider cursor-pointer">Practice Tracks</a>
                <a href="#/landing" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-slate-650 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wider cursor-pointer">How It Works</a>
              </div>
              <div className="flex flex-col gap-3.5 text-xs text-left">
                <span className="font-extrabold text-[10px] text-slate-400 dark:text-white/40 tracking-widest uppercase mb-1">RESOURCES</span>
                <a href="#/landing" onClick={(e) => handleScrollTo(e, 'manifesto')} className="text-slate-650 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wider cursor-pointer">Our Story</a>
                <a href="#/landing" onClick={(e) => handleScrollTo(e, 'faq')} className="text-slate-650 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wider cursor-pointer">FAQs</a>
                <span className="text-slate-350 dark:text-slate-650 cursor-not-allowed uppercase tracking-wider font-semibold">Security rules</span>
              </div>
            </div>
          </div>
          {/* Bottom Copyright Meta Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-650 uppercase relative z-10 pb-8">
            <span>© 2026 INTERVUE AI · ALL RIGHTS RESERVED</span>
            <span className="text-slate-450 dark:text-slate-550 font-black">DESIGNED FOR CALM, BUILT FOR REPS.</span>
            <div className="flex items-center gap-2 relative z-10">
              <span className="px-1.5 py-0.5 border border-slate-350 dark:border-white/20 rounded font-mono text-[10px]">WEBSOCKETS</span>
              <span className="px-1.5 py-0.5 border border-slate-350 dark:border-white/20 rounded font-mono text-[10px]">MEDIAPIPE</span>
              <span className="px-1.5 py-0.5 border border-slate-350 dark:border-white/20 rounded font-mono text-[10px]">JWT</span>
            </div>
          </div>
        </div>
        {/* Massive Solid Watermark */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[45px] sm:text-[90px] md:text-[135px] lg:text-[195px] xl:text-[225px] font-black tracking-[-0.05em] text-slate-950/[0.07] dark:text-white/[0.035] select-none pointer-events-none uppercase font-bold-display font-sans text-center w-full z-0 leading-none">
          INTERVUE.AI
        </div>
      </footer>
    </div>
  );
};

export default Landing;