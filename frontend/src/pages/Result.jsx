import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { CheckCircle, Award, AlertTriangle, ArrowLeft, Play, Pause, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
    return 'focus-area'; // Amber warnings, never red
  };

  // Play audio answers (Hybrid: IndexedDB local cache first for 0ms delay, fallback to server)
  const togglePlayAudio = async (idx, audioPath) => {
    const backendHost = window.location.hostname || 'localhost';
    const serverAudioUrl = audioPath ? `http://${backendHost}:5055${audioPath}` : null;

    if (playingAudio[idx]) {
      // Pause
      const aud = document.getElementById(`audio-player-${idx}`);
      if (aud) aud.pause();
      setPlayingAudio((prev) => ({ ...prev, [idx]: false }));
    } else {
      // Stop all currently playing audio first
      Object.keys(playingAudio).forEach((k) => {
        const aud = document.getElementById(`audio-player-${k}`);
        if (aud) aud.pause();
      });

      let aud = document.getElementById(`audio-player-${idx}`);
      if (!aud) {
        // Try local IndexedDB first for instant zero-latency playback
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
      <div className="flex-1 flex items-center justify-center p-12">
        <Mascot pose="neutral" size={80} className="animate-bounce" />
        <span className="text-sm font-bold text-text-secondary ml-3">Analyzing mock metrics...</span>
      </div>
    );
  }

  const overall = result?.interview?.overall_score || 0;
  const strengths = result?.answers?.filter((a) => a.score >= 7.5) || [];
  const focusAreas = result?.answers?.filter((a) => a.score < 7.5) || [];

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
            <div className="flex flex-wrap gap-2 mt-3.5">
              <a
                href={`/api/interview/${interviewId}/report`}
                target="_blank"
                rel="noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-all shadow-sm w-fit"
              >
                <span>Download PDF Report</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-accent-soft/30 border border-accent/15 px-6 py-4 rounded-3xl text-center flex-shrink-0 min-w-[120px]">
          <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block">Overall Score</span>
          <span className="text-3xl font-extrabold text-text-primary mt-1 block">{overall.toFixed(1)}</span>
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
                      <span className="text-[9px] font-bold text-text-muted uppercase">Your response transcript</span>
                      
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
                      "{ans.answer_text}"
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
                            ].map((sub, i) => (
                              sub.data && (
                                <div key={i} className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 p-2.5 rounded-xl">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub.label}</span>
                                    <span className={`text-[10px] font-black ${sub.data.score >= 7.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                      {sub.data.score}/10
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2" title={sub.data.reason}>
                                    {sub.data.reason}
                                  </p>
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
                            <div className="border-t border-slate-200/50 dark:border-zinc-800/30 pt-2 mt-1">
                              <strong className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Key Comparison Insight:</strong>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Compare this reference answer to your transcript. Focus on using specific technical keywords and structuring your response using quantified metrics.
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
                <span className="text-[10px] text-text-muted mt-0.5">
                  Look-away events detected: {result?.interview?.look_away_count || 0} times
                </span>
              </div>

              {/* Pace & WPM */}
              <div className="flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'var(--color-surface-border)' }}>
                <div className="flex justify-between font-bold">
                  <span>Speech pace average</span>
                  <strong className="text-text-primary">{result?.interview?.avg_wpm ? `${Math.round(result.interview.avg_wpm)} WPM` : '—'}</strong>
                </div>
                <span className="text-[10px] text-text-muted leading-relaxed">
                  Optimal pacing is between 120-160 Words Per Minute.
                </span>
              </div>

              {/* Total Filler count */}
              <div className="flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'var(--color-surface-border)' }}>
                <div className="flex justify-between font-bold">
                  <span>Filler words spoken</span>
                  <strong className="text-text-primary">{result?.interview?.total_filler || 0} times</strong>
                </div>
                <span className="text-[10px] text-text-muted leading-relaxed">
                  Monitors occurrences of speech breaks ("um", "like", "uh", "actually").
                </span>
              </div>
            </div>
          </Card>

          {/* study planner / roadmaps */}
          <Card className="flex flex-col gap-3">
            <h3 className="font-extrabold text-sm text-text-primary tracking-tight flex items-center gap-1.5">
              <span>📚</span> Study Roadmap Recommendations
            </h3>
            
            {result?.interview?.recommendations_json ? (
              <div className="flex flex-col gap-3 text-xs leading-relaxed">
                {JSON.parse(result.interview.recommendations_json).map((r, i) => (
                  <div key={i} className="surface-raised border p-3 rounded-2xl flex flex-col gap-1.5">
                    <span className="font-bold text-text-primary flex items-center gap-1">
                      🎯 {r.topic}
                    </span>
                    <div className="flex flex-col gap-1.5 mt-1">
                      {r.links.map((link, j) => (
                        <a
                          key={j}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                        >
                          <span>{link.icon || '🔗'}</span>
                          <span className="truncate">{link.name}</span>
                          <ExternalLink size={10} className="flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary italic">
                Study playlists being prepared by tutor companion...
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
export default Result;
