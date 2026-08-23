import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import Button from '../components/Button';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Search, Calendar, Award, AlertTriangle, ArrowUpRight, Zap, Target, FileText, CheckCircle2, ShieldAlert, Cpu, Video, MessageSquare, Eye, Layers, Lock, Unlock, Sparkles, BookOpen, ExternalLink, ChevronDown } from 'lucide-react';

// Animated Count component for numeric display
const NumberCounter = ({ targetValue, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(targetValue) || 0;
    if (end === 0) return;

    const duration = 1200;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue]);

  return <span>{decimals ? count.toFixed(decimals) : Math.round(count)}</span>;
};

// Inline SVG Sparkline component (Modern Vercel-style micro-columns)
const Sparkline = ({ data = [2, 3, 5, 4, 7], color = "indigo" }) => {
  const width = 64;
  const height = 28;
  const max = Math.max(...data) || 10;
  const cleanData = data.slice(-5);
  const barWidth = 5;
  const gap = 4;

  const colorMap = {
    indigo: '#6366f1',
    amber: '#f59e0b',
    rose: '#f43f5e',
    blue: '#3b82f6',
    orange: '#f97316'
  };
  const fillColor = colorMap[color] || '#6366f1';

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      {cleanData.map((val, idx) => {
        const barHeight = Math.max((val / max) * (height - 4), 4);
        const x = idx * (barWidth + gap);
        const y = height - barHeight;
        const isLast = idx === cleanData.length - 1;
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={2.5}
            fill={fillColor}
            opacity={isLast ? 1 : 0.35 + (idx * 0.12)}
            className="transition-all duration-300 hover:opacity-100"
          />
        );
      })}
    </svg>
  );
};

export const Dashboard = () => {
  const { user, showToast, darkMode } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadStats(period, customStart, customEnd);
  }, [user, period, customStart, customEnd]);

  const loadStats = async (activePeriod = period, start = customStart, end = customEnd) => {
    if (!stats) setLoading(true);
    try {
      const { data, error } = await api.getDashboardStats(user.user_id, activePeriod, start, end);
      if (!error && data) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    if (period === '7') return 'Past 7 Days';
    if (period === '30') return 'Past 30 Days';
    if (period === '90') return 'Past 90 Days';
    if (period === 'all') return 'All Time';
    if (period === 'custom') {
      if (customStart && customEnd) {
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const parts = dateStr.split('-');
          if (parts.length !== 3) return dateStr;
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${months[parseInt(parts[1]) - 1]} ${parts[2]}`;
        };
        return `${formatDate(customStart)} - ${formatDate(customEnd)}`;
      }
      return 'Custom Range';
    }
    return 'Past 30 Days';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-dashboard-bg flex items-center justify-center p-12 min-h-screen">
        <Mascot pose="neutral" size={60} className="animate-bounce" />
        <span className="text-xs font-bold text-text-secondary ml-3">Loading analytics workspace...</span>
      </div>
    );
  }

  const completedRounds = stats?.totalInterviews || 0;
  const avgScore = stats?.averageScore || 0;
  const wpm = stats?.avgWpm || 0;
  const totalFiller = stats?.totalFiller || 0;
  const streak = stats?.streak || 0;
  const activitySparkline = stats?.activitySparkline || [0, 0, 0, 0, 0, 0, 0];

  // Adaptive SVG colors based on dark mode
  const gridLineColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const dotFillColor  = darkMode ? '#F1F5F9'               : '#0F172A';

  const renderComparisonChart = () => {
    let rawProgress = stats?.weeklyProgress?.map((w) => parseFloat(w.avg_score) || 0) || [];
    const isMock = rawProgress.length < 2;
    const data = isMock ? [6.2, 7.0, 6.8, 7.8, 8.4] : rawProgress;

    const width = 280;
    const height = 150;
    const max = 10;

    // We start coordinates from x = 25 to leave space for Y-axis labels
    const startX = 25;
    const coords = data.map((val, idx) => {
      const x = startX + (idx / (data.length - 1)) * (width - startX);
      const y = height - (val / max) * (height - 20) - 10;
      return { x, y };
    });

    const getBezierPath = (pts) => {
      if (pts.length === 0) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const linePath = getBezierPath(coords);
    const fillPath = coords.length > 0 
      ? `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`
      : '';

    // Calculate Y coordinates for values 5, 6, 7, 8, 9
    const yValues = [9, 8, 7, 6, 5];
    const getY = (val) => height - (val / max) * (height - 20) - 10;

    return (
      <div className="relative w-full flex flex-col gap-2">
        {/* Target goal badge - absolute position above the y=7 line */}
        <div className="absolute top-[35px] left-10 bg-[#EEF2FF] border border-[#C7D2FE] dark:bg-[#1E1B4B] dark:border-[#312E81] text-[#4F46E5] dark:text-[#A5B4FC] text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider z-20 flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" /> Target Goal
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines and Labels */}
          {yValues.map((v) => {
            const y = getY(v);
            const isGoal = v === 7;
            return (
              <g key={v}>
                <text x="10" y={y + 3} className="fill-slate-400 dark:fill-white/30 text-[9px] font-mono font-bold" textAnchor="middle">
                  {v}
                </text>
                <line 
                  x1={startX} 
                  y1={y} 
                  x2={width} 
                  y2={y} 
                  stroke={isGoal ? "#818CF8" : gridLineColor} 
                  strokeWidth={isGoal ? "1.5" : "1"} 
                  strokeDasharray={isGoal ? "4" : "2"} 
                />
              </g>
            );
          })}
          
          {/* Fill under chart */}
          <path d={fillPath} fill="url(#areaGradient)" />
          
          {/* Chart line */}
          <path d={linePath} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Chart dots */}
          {coords.map((pt, idx) => (
            <circle 
              key={idx} 
              cx={pt.x} 
              cy={pt.y} 
              r="4" 
              fill="#FFFFFF" 
              stroke="#6366F1" 
              strokeWidth="2" 
              className="hover:scale-125 transition-transform" 
            />
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[8px] font-extrabold text-text-muted uppercase pl-[25px] pr-1">
          {data.map((_, i) => <span key={i}>Session {i + 1}</span>)}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 bg-dashboard-bg min-h-screen pb-24 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 flex flex-col gap-10">
        
        {/* Page Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-900/10 dark:border-white/5 pb-8">
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-black text-text-muted uppercase tracking-[0.25em]">
              <span>Workspace Dashboard</span> / <span>SaaS Overview</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-dashboard-dark tracking-[-0.03em] uppercase leading-[0.95] font-bold-display mt-2">
              Welcome back, <br className="hidden sm:inline" />{user.full_name?.split(' ')[0] || 'Rishab'}! 👋
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto relative">
            <div className="relative">
              <button
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="surface border rounded-full px-4 py-2 flex items-center gap-1.5 text-xs font-extrabold text-text-secondary uppercase shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 select-none transition-colors"
              >
                <Calendar size={12} className="text-text-muted" />
                <span>{getPeriodLabel()}</span>
                <ChevronDown size={10} className={`text-text-muted transition-transform duration-200 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Options */}
              {isPeriodDropdownOpen && (
                <>
                  {/* Clickaway backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsPeriodDropdownOpen(false)} />
                  
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-2 shadow-xl z-50 flex flex-col gap-1">
                    {[
                      { value: '7', label: 'Past 7 Days' },
                      { value: '30', label: 'Past 30 Days' },
                      { value: '90', label: 'Past 90 Days' },
                      { value: 'all', label: 'All Time' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setPeriod(option.value);
                          setIsPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold uppercase transition-colors ${
                          period === option.value
                            ? 'bg-indigo-50 dark:bg-indigo-950/20 text-blue-600 dark:text-indigo-400'
                            : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-zinc-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    
                    <div className="h-px bg-slate-100 dark:bg-zinc-850 my-1" />
                    
                    <button
                      onClick={() => {
                        setIsPeriodDropdownOpen(false);
                        setTempStart(customStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                        setTempEnd(customEnd || new Date().toISOString().split('T')[0]);
                        setIsCustomModalOpen(true);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold uppercase transition-colors ${
                        period === 'custom'
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 text-blue-600 dark:text-indigo-400'
                          : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      ✏️ Custom Range...
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/interview"
              className="bg-dashboard-dark text-white dark:text-zinc-950 rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-white/10"
            >
              <Play size={11} fill="currentColor" /> Start Practice Round
            </Link>
          </div>
        </div>

        {/* Custom Date Range Modal */}
        {isCustomModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-5 text-left"
            >
              <div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-indigo-400 uppercase tracking-widest block">Dashboard Range</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-tight tracking-tight">Customize Date Filters</h3>
              </div>
              
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-text-muted uppercase">Start Date</label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-text-muted uppercase">End Date</label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tempStart && tempEnd) {
                      setCustomStart(tempStart);
                      setCustomEnd(tempEnd);
                      setPeriod('custom');
                      setIsCustomModalOpen(false);
                    }
                  }}
                  disabled={!tempStart || !tempEnd}
                  className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Apply Range
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Metric Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {[
            {
              label: 'Sessions Done',
              value: <NumberCounter targetValue={completedRounds} />,
              unit: 'rounds',
              data: [1, 2, 2, 3, 3, completedRounds],
              icon: <Target size={15} className="text-indigo-500" />,
              iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/30',
              color: 'indigo'
            },
            {
              label: 'Avg Mock Score',
              value: <NumberCounter targetValue={avgScore} decimals={1} />,
              unit: '/ 10',
              data: [5.5, 6.2, 7.0, avgScore],
              icon: <Award size={15} className="text-amber-500" />,
              iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30',
              color: 'amber'
            },
            {
              label: 'Filler Words',
              value: <NumberCounter targetValue={totalFiller} />,
              unit: 'spoken',
              data: [8, 6, 5, 4, totalFiller],
              icon: <MessageSquare size={15} className="text-rose-500" />,
              iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/30',
              color: 'rose'
            },
            {
              label: 'Speech Pace',
              value: <NumberCounter targetValue={wpm} />,
              unit: 'WPM',
              data: [110, 125, 140, wpm || 135],
              icon: <Zap size={15} className="text-blue-500" />,
              iconBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/30',
              color: 'blue'
            },
            {
              label: 'Practice Streak',
              value: <NumberCounter targetValue={streak} />,
              unit: 'days 🔥',
              data: activitySparkline,
              colSpan: true,
              icon: <TrendingUp size={15} className="text-orange-500" />,
              iconBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/30',
              color: 'orange'
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 flex flex-col justify-between min-h-[135px] text-left transition-all group cursor-pointer ${card.colSpan ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-white/40 uppercase tracking-widest truncate">
                  {card.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-xl border ${card.iconBg} shrink-0 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>

              {/* Number & Unit + Sparkline */}
              <div className="flex items-end justify-between mt-3 gap-2">
                <div className="flex flex-col text-left">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-bold-display leading-none">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-white/40 uppercase tracking-wider mt-1">
                      {card.unit}
                    </span>
                  )}
                </div>
                <Sparkline data={card.data} color={card.color} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (takes 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* AI Insight Card */}
            <Card className="bg-indigo-50/75 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-left p-6 rounded-3xl flex flex-col justify-between min-h-[200px] relative overflow-hidden transition-all shadow-sm">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-200/40 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex justify-between items-start">
                <div className="bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-widest border border-indigo-200/50 dark:border-indigo-800/30 shadow-xs flex items-center gap-1">
                  <Sparkles size={10} className="fill-indigo-700/25 dark:fill-indigo-300/25 animate-pulse" /> Powered by AI
                </div>
              </div>

              <div className="my-4">
                <h3 className="text-xl font-bold tracking-tight leading-snug text-indigo-950 dark:text-indigo-100">
                  {completedRounds > 0 
                    ? "Your fluency scores improved by 12.5% this week!"
                    : "Upload your CV/resume PDF to begin custom AI mock practice"}
                </h3>
                <p className="text-sm text-indigo-800/75 dark:text-indigo-200/70 mt-2 leading-relaxed">
                  Gaze focus tracking recorded <strong className="text-indigo-750 dark:text-indigo-450 font-extrabold">92% camera eye contact</strong> during your latest session. Keep up the steady pace.
                </p>
              </div>

              <Link
                to="/interview"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-650 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-full text-center shadow-md hover:scale-[1.01] transition-transform w-fit cursor-pointer"
              >
                Target Weak Categories
              </Link>
            </Card>

            {/* Score Comparison & Focus Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Score Chart */}
              <Card className="p-5 flex flex-col gap-4 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-dashboard-dark uppercase tracking-wider">Score Comparison</h3>
                  <span className="text-xs text-text-muted block mt-0.5">Confidence evaluation trend across sessions</span>
                </div>
                {renderComparisonChart()}
              </Card>

              {/* Focus Areas */}
              <Card className="p-5 flex flex-col justify-between text-left gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-dashboard-dark uppercase tracking-wider font-bold-display">Preparation Focus</h3>
                  <span className="text-xs text-text-muted block mt-0.5">Top-down skill attribute categories</span>
                </div>

                <div className="flex flex-col gap-3.5 text-xs leading-relaxed text-text-secondary">
                  {[
                    { label: 'Technical Depth', pct: '82%', width: '82%', color: 'bg-[#6366F1]' },
                    { label: 'Fluency & Communication', pct: '75%', width: '75%', color: 'bg-[#3B82F6]' },
                    { label: 'Problem Solving', pct: '60%', width: '60%', color: 'bg-[#F59E0B]' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{bar.label}</span>
                        <span className="text-dashboard-dark">{completedRounds > 0 ? bar.pct : '0%'}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/[0.04] rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-white/5">
                        <div className={`h-full ${bar.color} rounded-full`} style={{ width: completedRounds > 0 ? bar.width : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 text-[11px] font-extrabold uppercase text-text-muted mt-2 border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6366F1]" /> Strong</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Focus area</span>
                </div>
              </Card>

            </div>

            {/* Preparation Checklist Card */}
            <Card className="p-6 text-left flex flex-col gap-6">
              <div>
                <h3 className="font-extrabold text-sm text-dashboard-dark uppercase tracking-wider font-bold-display">Preparation Checklist</h3>
                <span className="text-xs text-text-muted block mt-0.5">Syllabus mock requirements milestones</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {[
                  { label: '01. Setup reference CV profile', done: true, tag: 'COMPLETED', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30' },
                  { label: '02. Attempt first full mock round', done: completedRounds > 0, tag: 'COMPLETED', pendingTag: 'PENDING', badgeClass: completedRounds > 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30' },
                  { label: '03. Maintain average score >= 7.0', done: avgScore >= 7.0, tag: 'COMPLETED', pendingTag: 'PENDING', badgeClass: avgScore >= 7.0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30' },
                  { label: '04. Complete behavioral STAR rounds playlist', done: false, locked: true, tag: 'LOCKED', badgeClass: 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-white/30 border-slate-200/50 dark:border-white/5' },
                ].map((item, i) => {
                  const isLast = i === 3;
                  const isCompleted = item.done;
                  const isPending = !item.done && !item.locked;
                  const isLocked = item.locked;

                  let statusIcon = null;
                  if (isCompleted) {
                    statusIcon = <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-50/50 dark:fill-transparent" />;
                  } else if (isPending) {
                    statusIcon = <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 inline-block" />;
                  } else if (isLocked) {
                    statusIcon = <Lock size={12} className="text-slate-400 dark:text-white/30" />;
                  }

                  const displayTag = isCompleted ? item.tag : isLocked ? item.tag : item.pendingTag;

                  return (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between py-2 border-slate-100 dark:border-white/5 ${!isLast ? 'border-b' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0">{statusIcon}</div>
                        <span className={`text-sm font-bold ${isLocked ? 'text-slate-400 dark:text-white/30' : 'text-text-primary'}`}>{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${item.badgeClass}`}>
                        {displayTag}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Next Practice (Bottom CTA nested inside Card) */}
              <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 mt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Target size={18} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#4F46E5] bg-[#EEF2FF] dark:text-[#A5B4FC] dark:bg-[#1E1B4B] border border-[#C7D2FE] dark:border-[#312E81] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Recommended Next Practice
                      </span>
                      <span className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10.5px] px-2 py-0.5 rounded-full uppercase tracking-widest">
                        +50 XP
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                      You haven't practiced technical SQL bottlenecks questions yet. Let's do a quick mock session.
                    </p>
                  </div>
                </div>
                <Link
                  to="/interview"
                  className="bg-dashboard-dark hover:bg-slate-800 dark:bg-white dark:text-[#0B0F19] dark:hover:bg-slate-100 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1 border border-transparent dark:border-white/10"
                >
                  Practice Category <ArrowUpRight size={12} className="ml-0.5" />
                </Link>
              </div>
            </Card>

          </div>

          {/* Right Column (takes 1 col) */}
          <div className="flex flex-col gap-8 lg:col-span-1">
            
            {/* Device Config Status */}
            <Card className="p-5 text-left flex flex-col gap-4">
              <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Device Config Status</span>
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: <Eye size={12} className="text-indigo-600 dark:text-indigo-400" />, label: 'Eye-Gaze Tracking', status: 'Active' },
                  { icon: <Layers size={12} className="text-indigo-600 dark:text-indigo-400" />, label: 'Custom LLM Question pool', status: 'Enabled' },
                  { icon: <MessageSquare size={12} className="text-indigo-600 dark:text-indigo-400" />, label: 'Follow-Up conversations', status: 'Active' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm font-bold text-text-secondary">
                    <span className="flex items-center gap-2">{item.icon} {item.label}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[11px] tracking-wide">{item.status}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Roadmap Recommendations */}
            <Card className="p-5 text-left flex flex-col gap-4">
              <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={14} className="text-indigo-500" /> Study Roadmap Recommendations
              </span>

              {stats?.latestRecommendations && stats.latestRecommendations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {stats.latestRecommendations.slice(0, 3).map((roadmap, i) => (
                    <div key={i} className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 p-3.5 rounded-2xl flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 leading-snug">
                        🎯 {roadmap.topic}
                      </span>
                      <div className="flex flex-col gap-2 mt-1">
                        {roadmap.links.map((link, j) => (
                          <a
                            key={j}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors group w-fit max-w-full"
                          >
                            <span className="shrink-0">{link.icon || '🔗'}</span>
                            <span className="truncate group-hover:underline">{link.name}</span>
                            <ExternalLink size={10} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 p-5 rounded-2xl text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-white/5">
                    <Sparkles size={16} />
                  </div>
                  <strong className="text-xs text-[#0B0F19] dark:text-zinc-200 font-bold block">No recommendations yet</strong>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-[200px]">
                    Complete your first mock interview to generate personalized study roadmaps here.
                  </p>
                </div>
              )}
              <Link to="/courses" className="text-xs font-extrabold text-blue-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-0.5 mt-auto pt-2 border-t border-slate-100 dark:border-white/5 w-fit">
                Manage Study Path <ArrowUpRight size={10} />
              </Link>
            </Card>

            {/* Active CV */}
            <Card className="p-5 text-left flex flex-col gap-4">
              <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Active Reference CV</span>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/5 p-3.5 rounded-xl">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                <div className="max-w-[170px] truncate">
                  <strong className="text-xs text-dashboard-dark block truncate">Active CV Profile</strong>
                  <span className="text-xs text-text-secondary block mt-0.5">Target: Software Engineer</span>
                </div>
              </div>
              <Link to="/upload" className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-0.5 w-fit">
                Update Resume <ArrowUpRight size={10} />
              </Link>
            </Card>

          </div>

        </div>

      </div>
    </motion.div>
  );
};
export default Dashboard;
