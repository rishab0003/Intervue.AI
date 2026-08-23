import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { CheckCircle, Award, AlertTriangle, ArrowLeft, Play, Pause, ExternalLink, HelpCircle, FileText, Download, X, Target, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioLocal } from '../utils/indexedDB';

export const Result = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('id');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState({}); // idx -> boolean
  const [openModelAnswers, setOpenModelAnswers] = useState({}); // idx -> boolean
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    summary: true,
    radar: true,
    breakdown: true,
    fillers: true,
    roadmap: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (!interviewId) {
      showToast("No interview ID specified", "error");
      navigate('/dashboard');
      return;
    }
    loadResults();
  }, [user, interviewId]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.getResults(interviewId);
      if (error) {
        showToast(error, 'error');
        navigate('/dashboard');
        return;
      }
      setResult(data);
    } catch (err) {
      showToast("Cannot fetch mock results.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7.5) return 'success';
    return 'focus-area';
  };

  // Play audio answers
  const togglePlayAudio = async (idx, audioPath) => {
    const backendHost = window.location.hostname || 'localhost';
    const serverAudioUrl = audioPath ? `http://${backendHost}:5055${audioPath}` : null;

    if (playingAudio[idx]) {
      const aud = document.getElementById(`audio-player-${idx}`);
      if (aud) aud.pause();
      setPlayingAudio((prev) => ({ ...prev, [idx]: false }));
    } else {
      Object.keys(playingAudio).forEach((k) => {
        const aud = document.getElementById(`audio-player-${k}`);
        if (aud) aud.pause();
      });

      let aud = document.getElementById(`audio-player-${idx}`);
      if (!aud) {
        const localBlobUrl = await getAudioLocal(interviewId, idx);
        const playUrl = localBlobUrl || serverAudioUrl;

        if (!playUrl) {
          showToast("No audio recording available for this question.", "info");
          return;
        }

        aud = new Audio(playUrl);
        aud.id = `audio-player-${idx}`;
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-dashboard-bg min-h-screen">
        <Mascot pose="neutral" size={80} className="animate-bounce" />
        <span className="text-sm font-bold text-text-secondary mt-3">Analyzing mock metrics...</span>
      </div>
    );
  }

  const overall = result?.interview?.overall_score || 0;
  const answersWithWpm = result?.answers?.filter(a => a.wpm > 0) || [];
  const computedAvgWpm = (result?.interview?.avg_wpm && result.interview.avg_wpm > 0)
    ? Math.round(result.interview.avg_wpm)
    : (answersWithWpm.length > 0 ? Math.round(answersWithWpm.reduce((sum, a) => sum + a.wpm, 0) / answersWithWpm.length) : 0);

  const computedTotalFiller = (result?.interview?.total_filler !== undefined && result?.interview?.total_filler !== null)
    ? result.interview.total_filler
    : (result?.answers?.reduce((sum, a) => sum + (a.filler_count || 0), 0) || 0);

  // Calculate 5-axis Competency Radar scores
  const getCompetencyScores = () => {
    if (!result?.answers || result.answers.length === 0) {
      return { technical: 80, problem: 75, pacing: 80, star: 70, architecture: 75 };
    }
    const techAns = result.answers.filter(a => a.category === 'Technical');
    const probAns = result.answers.filter(a => a.category === 'Problem Solving');
    const behAns = result.answers.filter(a => a.category === 'Behavioral');

    const avg = (arr) => arr.length > 0 ? (arr.reduce((sum, a) => sum + (a.score || 7), 0) / arr.length) * 10 : 75;

    return {
      technical: Math.round(avg(techAns)),
      problem: Math.round(avg(probAns)),
      pacing: Math.min(100, Math.round((computedAvgWpm > 0 ? Math.min(160, computedAvgWpm) / 160 : 0.8) * 100)),
      star: Math.round(avg(behAns)),
      architecture: Math.round((overall / 10) * 90)
    };
  };

  const compScores = getCompetencyScores();

  // Helper to render filler word highlighted transcript
  const renderAnnotatedTranscript = (text) => {
    if (!text) return null;
    const fillers = ["um", "uh", "umm", "like", "actually", "basically", "you know", "i mean"];
    const regex = new RegExp(`\\b(${fillers.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (fillers.includes(part.toLowerCase())) {
        return (
          <span key={i} className="relative group inline-block mx-0.5">
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/50 px-1.5 py-0.5 rounded-md text-[11px] font-black underline decoration-amber-500 cursor-help">
              {part}
            </span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-30">
              💡 Tip: Pause briefly instead of using "{part}"
            </span>
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6 relative z-10 text-left"
    >
      <Link to="/dashboard" className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5 w-fit">
        <ArrowLeft size={13} /> Back to dashboard
      </Link>

      {/* Greeting celebrate header */}
      <Card className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <Mascot pose="celebrate" size={70} />
          <div>
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest">Mock Practice Finished</span>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-1">
              Solid effort! 🎉 You scored {overall.toFixed(1)}/10
            </h1>
            <p className="text-xs text-text-secondary mt-1 max-w-md leading-relaxed">
              We've compiled your verbal analytics, gaze tracking metrics, and study playlists below.
            </p>
          </div>
        </div>

        {/* Right side: Overall Score Card & Download PDF Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
          <div className="bg-accent-soft/30 border border-accent/15 px-6 py-3.5 rounded-3xl text-center min-w-[120px]">
            <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block">Overall Score</span>
            <span className="text-3xl font-extrabold text-text-primary mt-0.5 block">{overall.toFixed(1)}</span>
          </div>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold rounded-2xl px-5 py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer whitespace-nowrap"
          >
            <Download size={15} />
            <span>Download PDF Report</span>
          </button>
        </div>
      </Card>

      {/* 5-Axis Competency Radar Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-xs">
        <div className="flex flex-col gap-2 max-w-md text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
              Competency Map
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">5-Axis Skill Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed">
            Evaluates your balance across technical depth, problem-solving, speech pacing, STAR methodology, and system design logic.
          </p>
        </div>

        {/* SVG Radar */}
        <div className="relative p-2 shrink-0">
          <svg width="220" height="220" className="overflow-visible">
            {/* Radar Background Polygons */}
            {[0.25, 0.5, 0.75, 1].map((scale, levelIdx) => {
              const pts = [0, 1, 2, 3, 4].map(i => {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const r = scale * 75;
                return `${110 + r * Math.cos(angle)},${110 + r * Math.sin(angle)}`;
              }).join(' ');
              return <polygon key={levelIdx} points={pts} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-zinc-800" />;
            })}
            {/* Axis Lines */}
            {[0, 1, 2, 3, 4].map(i => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              return <line key={i} x1="110" y1="110" x2={110 + 75 * Math.cos(angle)} y2={110 + 75 * Math.sin(angle)} stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-zinc-800" />;
            })}
            {/* Radar Filled Polygon */}
            {(() => {
              const axes = [compScores.technical, compScores.problem, compScores.pacing, compScores.star, compScores.architecture];
              const pts = axes.map((val, i) => {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const r = (val / 100) * 75;
                return `${110 + r * Math.cos(angle)},${110 + r * Math.sin(angle)}`;
              }).join(' ');
              return <polygon points={pts} fill="rgba(2, 132, 199, 0.25)" stroke="#0284C7" strokeWidth="2.5" />;
            })()}
            {/* Axis Labels */}
            {['Tech', 'Problem', 'Pacing', 'STAR', 'Arch'].map((label, i) => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const x = 110 + 92 * Math.cos(angle);
              const y = 110 + 92 * Math.sin(angle);
              return (
                <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black fill-slate-600 dark:fill-zinc-300 uppercase">
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Answer breakdowns, audio list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-text-primary tracking-tight">Question-by-Question breakdown</h3>
            <div className="flex flex-col gap-4">
              {result?.answers?.map((ans, idx) => (
                <Card key={idx} className="flex flex-col gap-3 p-5">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                      {ans.category}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      ans.score >= 7.5 ? 'badge-success' : 'badge-warning'
                    }`}>
                      Score: {ans.score.toFixed(1)}/10
                    </span>
                  </div>

                  <strong className="text-xs text-text-primary block leading-relaxed">{ans.question_text}</strong>

                  {/* Highlighted answer transcript */}
                  <div className="surface-raised border rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-text-muted uppercase">Your response transcript (Annotated)</span>
                      
                      {/* Audio playback button */}
                      {ans.audio_path && (
                        <button
                          onClick={() => togglePlayAudio(idx, ans.audio_path)}
                          className="surface border text-text-secondary hover:text-accent p-1.5 rounded-full shadow-sm flex items-center justify-center cursor-pointer transition-colors"
                          title="Play answer recording"
                        >
                          {playingAudio[idx] ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        </button>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed italic ${
                      ans.score >= 7.5 ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      "{renderAnnotatedTranscript(ans.answer_text)}"
                    </p>
                  </div>

                  {/* Feedback summary */}
                  <div className="text-xs text-text-secondary leading-relaxed surface-raised border p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">💡</span>
                      <p className="font-medium text-slate-700 dark:text-zinc-300 text-[13px]">{ans.feedback || 'Actionable feedback being compiled by AI coach...'}</p>
                    </div>
                    
                    {ans.sub_scores_json && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 mt-1">
                        {(() => {
                          try {
                            const subScores = JSON.parse(ans.sub_scores_json);
                            return [
                              { key: 'structure', label: 'Structure', data: subScores.structure },
                              { key: 'content_depth', label: 'Content Depth', data: subScores.content_depth },
                              { key: 'clarity_delivery', label: 'Delivery', data: subScores.clarity_delivery }
                            ].map(sc => sc.data && (
                              <div key={sc.key} className="flex flex-col gap-1 surface p-2.5 rounded-xl border">
                                <span className="text-[10px] font-bold text-text-muted">{sc.label}</span>
                                <span className="text-xs font-black text-text-primary">{sc.data.score}/10</span>
                                <span className="text-[10px] text-text-secondary leading-snug">{sc.data.feedback}</span>
                              </div>
                            ));
                          } catch (e) { return null; }
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Model Answer Collapsible */}
                  {ans.model_answer && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => setOpenModelAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-xs font-bold text-blue-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer select-none outline-none"
                      >
                        <span>{openModelAnswers[idx] ? '📖 Hide Model Answer' : '📖 View Model Answer & Comparison'}</span>
                      </button>
                      
                      {openModelAnswers[idx] && (
                        <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-150/40 dark:border-indigo-900/30 p-4 rounded-2xl text-xs leading-relaxed mt-2 text-left animate-slide-in">
                          <div className="flex flex-col gap-2">
                            <div>
                              <strong className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">AI Recommended Ideal Answer:</strong>
                              <p className="text-slate-700 dark:text-zinc-300 mt-1 font-medium italic">
                                "{ans.model_answer}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Speech and proctoring stats */}
        <div className="flex flex-col gap-6">
          {/* Verbal & Attention stats */}
          <Card className="flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-text-primary tracking-tight">Mock Analytics</h3>

            <div className="flex flex-col gap-4 text-xs leading-relaxed text-text-secondary">
              {/* Attention Score progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span>Camera Focus (Attention)</span>
                  <strong className="text-text-primary">{result?.interview?.attention_score || 100}%</strong>
                </div>
                <ProgressBar value={result?.interview?.attention_score || 100} color={getScoreColor(result?.interview?.attention_score || 100)} />
              </div>

              {/* Pace & WPM */}
              <div className="flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'var(--color-surface-border)' }}>
                <div className="flex justify-between font-bold">
                  <span>Speech pace average</span>
                  <strong className="text-text-primary">{computedAvgWpm > 0 ? `${computedAvgWpm} WPM` : '—'}</strong>
                </div>
              </div>

              {/* Total Filler count */}
              <div className="flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'var(--color-surface-border)' }}>
                <div className="flex justify-between font-bold">
                  <span>Filler words spoken</span>
                  <strong className="text-text-primary">{computedTotalFiller} times</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Customizer Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPdfModalOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-left"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Export PDF Report</h3>
              </div>
              <button onClick={() => setPdfModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { id: 'summary', label: 'Overall Score & Executive Summary' },
                { id: 'radar', label: '5-Axis Competency Radar Chart' },
                { id: 'breakdown', label: 'Question-by-Question Detailed Feedback' },
                { id: 'fillers', label: 'Filler Word & Speech Pacing Breakdown' },
                { id: 'roadmap', label: '7-Day Recommended Study Roadmap' },
              ].map(opt => (
                <label key={opt.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl cursor-pointer border border-slate-200/60 dark:border-white/5">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={pdfOptions[opt.id]}
                    onChange={(e) => setPdfOptions(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPdfModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-extrabold text-slate-600 dark:text-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <a
                href={`/api/interview/${interviewId}/report`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setPdfModalOpen(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};
export default Result;
