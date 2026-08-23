import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, ChevronRight, FileText, ArrowLeft, TrendingUp, X, Award, Eye, Activity, HelpCircle, AlertTriangle, Play, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const History = () => {
  const { user, showToast, darkMode } = useApp();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState({});

  // Drawer details state
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [details, setDetails] = useState({}); // interviewId -> details
  const [detailsLoading, setDetailsLoading] = useState({}); // interviewId -> bool

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.getHistory(user.user_id);
      if (error) {
        showToast(error, 'error');
        return;
      }
      setHistory(data?.interviews || []);
    } catch (err) {
      showToast("Cannot fetch mock history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (interviewId) => {
    setSelectedSessionId(interviewId);
    setIsDrawerOpen(true);

    if (!details[interviewId]) {
      setDetailsLoading(prev => ({ ...prev, [interviewId]: true }));
      try {
        const { data, error } = await api.getResults(interviewId);
        if (!error && data) {
          setDetails(prev => ({ ...prev, [interviewId]: data }));
        } else {
          showToast(error || "Failed to load session details", "error");
        }
      } catch (err) {
        showToast("Error loading details", "error");
      } finally {
        setDetailsLoading(prev => ({ ...prev, [interviewId]: false }));
      }
    }
  };

  const togglePlayAudio = (idx, audioPath) => {
    const backendHost = window.location.hostname || 'localhost';
    const formattedPath = audioPath ? (audioPath.startsWith('/') ? audioPath : `/${audioPath}`) : '';
    const serverAudioUrl = audioPath ? (audioPath.startsWith('http') ? audioPath : `http://${backendHost}:5055${formattedPath}`) : null;

    if (!serverAudioUrl) {
      showToast("No audio recording found for this question.", "info");
      return;
    }

    if (playingAudio[idx]) {
      const aud = document.getElementById(`drawer-audio-${idx}`);
      if (aud) aud.pause();
      setPlayingAudio((prev) => ({ ...prev, [idx]: false }));
    } else {
      Object.keys(playingAudio).forEach((k) => {
        const aud = document.getElementById(`drawer-audio-${k}`);
        if (aud) aud.pause();
      });

      let aud = document.getElementById(`drawer-audio-${idx}`);
      if (!aud) {
        aud = new Audio(serverAudioUrl);
        aud.id = `drawer-audio-${idx}`;
        aud.onended = () => {
          setPlayingAudio((prev) => ({ ...prev, [idx]: false }));
        };
        document.body.appendChild(aud);
      }

      aud.play();
      setPlayingAudio((prev) => {
        const next = {};
        Object.keys(prev).forEach((k) => { next[k] = false; });
        next[idx] = true;
        return next;
      });
    }
  };

  const gridLineColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const dotFillColor  = darkMode ? '#F1F5F9'               : '#0F172A';

  // Full-width trend chart renderer using SVG paths
  const renderTrendChart = () => {
    const data = history.map((h) => h.overall_score || 0).reverse();
    if (data.length < 2) return null;

    const width = 600;
    const height = 120;
    const max = 10;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / max) * (height - 12) - 6;
      return `${x},${y}`;
    }).join(' ');

    const fillPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <Card className="p-5 text-left flex flex-col gap-4">
        <div>
          <h3 className="font-extrabold text-xs text-dashboard-dark uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={13} className="text-dashboard-lime" /> Lifetime Confidence Curve
          </h3>
          <span className="text-[9px] text-text-muted block mt-0.5">Mock evaluation score timeline progression</span>
        </div>

        <div className="relative w-full overflow-visible">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
            <defs>
              <linearGradient id="historyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke={gridLineColor} strokeWidth="1" />
            <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke={gridLineColor} strokeWidth="1" />
            <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke={gridLineColor} strokeWidth="1" />

            <polygon points={fillPoints} fill="url(#historyGlow)" />
            <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {data.map((val, idx) => {
              const x = (idx / (data.length - 1)) * width;
              const y = height - (val / max) * (height - 12) - 6;
              return (
                <circle key={idx} cx={x} cy={y} r="3.5" fill={dotFillColor} stroke="var(--color-accent)" strokeWidth="1.5" />
              );
            })}
          </svg>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-dashboard-bg flex items-center justify-center p-12 min-h-screen">
        <Mascot pose="neutral" size={60} className="animate-bounce" />
        <span className="text-sm font-bold text-text-secondary ml-3">Loading mock history...</span>
      </div>
    );
  }

  const activeSessionMeta = history.find(s => s.interview_id === selectedSessionId);
  const activeDetail = details[selectedSessionId];
  const isActiveLoading = detailsLoading[selectedSessionId];

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen pb-16 text-left relative overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 pt-6 flex flex-col gap-6">
        
        {/* Breadcrumbs */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">
              <span>Prep</span> / <span>Sessions History</span>
            </div>
            <h1 className="text-2xl font-black text-dashboard-dark tracking-tight uppercase font-bold-display mt-1">
              Your Sessions Log
            </h1>
          </div>
          <Link to="/dashboard" className="text-xs font-bold text-text-secondary hover:text-dashboard-dark flex items-center gap-1">
            <ArrowLeft size={12} /> Dashboard
          </Link>
        </div>

        {/* Full width curve chart */}
        {history.length >= 2 && renderTrendChart()}

        {/* Session cards list */}
        {history.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center gap-4 min-h-[320px]">
            <Mascot pose="encourage" size={60} />
            <div>
              <h3 className="font-bold text-sm text-dashboard-dark font-bold-display uppercase">No mock sessions completed yet</h3>
              <p className="text-xs text-text-secondary leading-normal max-w-xs mt-1">
                Start your first custom interview session to unlock confidence progress charts and study playlists.
              </p>
            </div>
            <Link to="/interview">
              <Button className="mt-2 bg-dashboard-dark text-white dark:text-zinc-950 rounded-full px-6 py-2.5 text-[10px] uppercase font-bold hover:opacity-90 transition-opacity">
                Start First Practice
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">All completed rounds</span>
            
            <div className="flex flex-col gap-3">
              {history.map((session, i) => {
                const score = session.overall_score !== null ? session.overall_score.toFixed(1) : '—';
                const isHigh = session.overall_score >= 7.5;
                const isSelected = selectedSessionId === session.interview_id && isDrawerOpen;

                return (
                  <motion.div
                    key={session.interview_id}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    onClick={() => handleSelectSession(session.interview_id)}
                    className={`surface border rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer select-none transition-colors ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="surface-raised border p-2.5 rounded-xl text-text-secondary">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-dashboard-dark uppercase tracking-tight font-bold-display">
                          {session.title || `Mock Practice Round #${history.length - i}`}
                        </h4>
                        <div className="flex items-center gap-2.5 text-[9px] text-text-secondary mt-0.5 font-semibold">
                          <span className="flex items-center gap-0.5"><Calendar size={9} /> {new Date(session.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{session.total_questions || 5} questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Ring-like score badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                        isHigh ? 'badge-success' : 'badge-warning'
                      }`}>
                        {score}/10
                      </div>
                      <ChevronRight size={14} className="text-text-muted" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modern Slide-out Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[900]"
            />

            {/* Slide-over Card */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 220 }}
              data-lenis-prevent
              data-lenis-prevent-wheel
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800/80 z-[1000] shadow-2xl flex flex-col overscroll-contain"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-zinc-900 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/10">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Session Report</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-tight tracking-tight">
                    {activeSessionMeta?.title || 'Practice Details'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-400 mt-1">
                    <Calendar size={10} />
                    <span>{activeSessionMeta ? new Date(activeSessionMeta.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-2xl text-center border shadow-sm ${
                    activeSessionMeta?.overall_score >= 7.5 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                      : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                  }`}>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold block text-slate-400 dark:text-slate-500">Score</span>
                    <strong className="text-lg font-black">{activeSessionMeta?.overall_score?.toFixed(1) || '—'}</strong>
                  </div>
                  
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div
                data-lenis-prevent
                data-lenis-prevent-wheel
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 overscroll-contain touch-pan-y"
              >
                {isActiveLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[300px]">
                    <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <strong className="text-xs text-slate-500 uppercase tracking-widest">Compiling details...</strong>
                  </div>
                ) : activeDetail ? (
                  <>
                    {/* Performance Metrics Block */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Verbal & Proctoring Analytics</span>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-center">
                          <Eye size={16} className="text-indigo-500 mx-auto mb-1.5" />
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">Attention</span>
                          <strong className="text-sm font-black text-slate-800 dark:text-zinc-200 mt-0.5 block">
                            {activeDetail.interview?.attention_score || 100}%
                          </strong>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-center">
                          <Activity size={16} className="text-indigo-500 mx-auto mb-1.5" />
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">Pacing</span>
                          <strong className="text-sm font-black text-slate-800 dark:text-zinc-200 mt-0.5 block">
                            {activeDetail.interview?.avg_wpm ? `${Math.round(activeDetail.interview.avg_wpm)} WPM` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-center">
                          <AlertTriangle size={16} className="text-amber-500 mx-auto mb-1.5" />
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">Look Aways</span>
                          <strong className="text-sm font-black text-slate-800 dark:text-zinc-200 mt-0.5 block">
                            {activeDetail.interview?.look_away_count || 0}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Question Breakdown List */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Question-by-Question Assessment</span>

                      {activeDetail.answers && activeDetail.answers.length > 0 ? (
                        activeDetail.answers.map((ans, idx) => (
                          <div 
                            key={idx} 
                            className={`bg-slate-50/50 dark:bg-zinc-900/10 border rounded-2xl p-4 flex flex-col gap-3 text-left transition-all ${
                              ans.score >= 7.5 ? 'border-l-4 border-l-emerald-500 border-slate-200/80 dark:border-zinc-800/80' : 'border-l-4 border-l-amber-500 border-slate-200/80 dark:border-zinc-800/80'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2.5 py-0.5 rounded-md">
                                Q{idx + 1} · {ans.category}
                              </span>
                              <span className={`text-[11px] font-extrabold ${ans.score >= 7.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                Score {ans.score.toFixed(1)}/10
                              </span>
                            </div>

                            <strong className="text-[13px] text-slate-900 dark:text-white leading-snug font-bold">
                              {ans.question_text}
                            </strong>

                            {/* Response text snippet */}
                            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 p-3 rounded-xl flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Your Answer</span>
                                {ans.audio_path && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePlayAudio(idx, ans.audio_path);
                                    }}
                                    className="p-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform flex items-center gap-1 text-[9px] font-bold px-2 cursor-pointer"
                                  >
                                    {playingAudio[idx] ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                                    <span>{playingAudio[idx] ? 'Pause Audio' : 'Play Audio'}</span>
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] italic text-slate-600 dark:text-zinc-400 leading-relaxed truncate-2-lines">
                                "{ans.answer_text}"
                              </p>
                            </div>

                            {/* AI Actionable Feedback */}
                            <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/10 p-3.5 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed text-slate-700 dark:text-zinc-350">
                              <span className="text-xs mt-0.5">💡</span>
                              <div>
                                <strong className="font-bold text-slate-900 dark:text-white block mb-0.5 text-[11px]">AI Coach Insight</strong>
                                {ans.feedback || 'Analyzing response...'}
                              </div>
                            </div>

                            {/* Sub Score Bars */}
                            {ans.sub_scores_json && (
                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900/50">
                                {(() => {
                                  try {
                                    const sub = JSON.parse(ans.sub_scores_json);
                                    return [
                                      { label: 'Structure', data: sub.structure },
                                      { label: 'Content Depth', data: sub.content_depth },
                                      { label: 'Delivery', data: sub.clarity_delivery }
                                    ].map((item, subIdx) => (
                                      item.data && (
                                        <div key={subIdx} className="flex items-center gap-2">
                                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 w-20 shrink-0">{item.label}</span>
                                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.data.score >= 7.5 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${item.data.score * 10}%` }}></div>
                                          </div>
                                          <span className="text-[9px] font-black text-slate-700 dark:text-zinc-350 w-8 text-right shrink-0">{item.data.score}/10</span>
                                        </div>
                                      )
                                    ));
                                  } catch (e) {
                                    return null;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50/50 dark:bg-zinc-900/10 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-8 text-center italic text-xs text-slate-450 dark:text-slate-500">
                          No questions were answered during this session.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 italic text-slate-400">
                    Failed to fetch details. Please try again.
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex gap-3">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-350 font-bold py-3 px-4 rounded-2xl text-[10px] uppercase tracking-wider transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedSessionId) {
                      setIsDrawerOpen(false);
                      navigate(`/result?id=${selectedSessionId}`);
                    } else {
                      showToast("Please select a session first", "info");
                    }
                  }}
                  className="flex-1 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  View Full Report & Audio
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default History;
