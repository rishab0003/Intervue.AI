import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import Button from '../components/Button';
import { Upload as UploadIcon, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Upload = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'ats'

  // Gap Analysis State
  const [jobDescription, setJobDescription] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadActiveResume();
  }, [user]);

  const loadActiveResume = async () => {
    try {
      const { data, error } = await api.getActiveResume(user.user_id);
      if (!error && data) {
        setResumeData(data);
      }
    } catch (err) {
      console.warn("Could not retrieve latest reference resume:", err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (file.type !== "application/pdf") {
      showToast("Only PDF files are supported for resume customization", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', user.user_id);

    try {
      const { data, error } = await api.uploadResume(formData);
      if (error) {
        showToast(error, 'error');
        setLoading(false);
        return;
      }
      showToast("Resume parsed and active reference updated! 🎉", "success");
      setResumeData(data);
    } catch (err) {
      showToast("Server connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGapAnalysis = async () => {
    if (!jobDescription.trim()) {
      showToast("Please enter a job description first.", "error");
      return;
    }
    
    setGapLoading(true);
    setGapResult(null);
    try {
      const { data, error } = await api.analyzeGap(user.user_id, resumeData.resume_id, jobDescription);
      if (error) {
        showToast(error, 'error');
      } else {
        setGapResult(data);
        showToast("Gap analysis complete!", "success");
      }
    } catch (err) {
      showToast("Failed to perform gap analysis.", "error");
    } finally {
      setGapLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6 relative z-10 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Resume Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Upload and manage your CV to calibrate tailored practice questions for your interview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Simple Upload Card */}
        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[440px] shadow-sm">
          <form
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all relative ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10 scale-[1.01]' 
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700'
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Clean SaaS circular spinner */}
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-semibold text-slate-900 dark:text-white">Analyzing Skills</strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tailoring custom practice tracks...</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UploadIcon size={28} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <strong className="text-base text-slate-900 dark:text-white block font-semibold">Upload Your Resume</strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block max-w-[240px] leading-relaxed">
                    Drag and drop your resume file (PDF) here, or browse local files. Max size 5MB.
                  </span>
                </div>
                
                <label className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold rounded-xl px-5 py-2.5 text-xs tracking-wide shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer select-none">
                  <UploadIcon size={13} />
                  <span>Choose Resume File</span>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Clean SaaS Profile Card */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {resumeData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <div className="bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 h-full flex flex-col justify-between gap-6 shadow-sm">
                  <div className="flex flex-col gap-5">
                    {/* Status & Tab Toggle Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60 pb-3">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={14} />
                        <strong className="text-xs font-bold uppercase tracking-wider">Active Config</strong>
                      </div>
                      
                      {/* Tabs selector */}
                      <div className="flex bg-slate-50 dark:bg-zinc-850 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
                        <button
                          type="button"
                          onClick={() => setActiveTab('details')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            activeTab === 'details'
                              ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('ats')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            activeTab === 'ats'
                              ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          ATS Score
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === 'details' ? (
                        <motion.div
                          key="details-tab"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex flex-col gap-4 text-left"
                        >
                          {/* Role Block */}
                          <div className="bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                              <FileText size={20} />
                            </div>
                            <div className="text-left">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Target Role</span>
                              <strong className="text-sm font-semibold text-slate-800 dark:text-zinc-100 block mt-0.5">
                                {resumeData.primary_role || 'Software Engineer'}
                              </strong>
                            </div>
                          </div>

                          {/* Extracted Experience & Education grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/50 p-3.5 rounded-2xl text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Experience</span>
                              <strong className="text-xs text-slate-800 dark:text-zinc-200 mt-1 block truncate font-semibold" title={resumeData.experience}>
                                {resumeData.experience || 'Fresher'}
                              </strong>
                            </div>
                            <div className="bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/50 p-3.5 rounded-2xl text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Education</span>
                              <strong className="text-xs text-slate-800 dark:text-zinc-200 mt-1 block truncate font-semibold" title={resumeData.education}>
                                {resumeData.education || 'N/A'}
                              </strong>
                            </div>
                          </div>

                          {/* Skills pills */}
                          {(() => {
                            const skillsArray = resumeData.skills_array || (resumeData.skills ? resumeData.skills.split(",").map(s => s.trim()) : []);
                            return skillsArray.length > 0 && (
                              <div className="flex flex-col gap-2 text-left">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Technical Skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {skillsArray.slice(0, 10).map((skill, i) => (
                                    <span 
                                      key={i} 
                                      className="text-[10px] font-medium bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-slate-350 border border-slate-200/60 dark:border-zinc-800/60 px-2.5 py-0.5 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-zinc-850"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Identified Projects */}
                          {resumeData.projects && resumeData.projects.length > 0 && (
                            <div className="flex flex-col gap-2 text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identified Projects</span>
                              <div className="flex flex-col gap-2">
                                {resumeData.projects.slice(0, 2).map((proj, i) => (
                                  <div key={i} className="bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-xl text-left">
                                    <strong className="text-xs text-slate-800 dark:text-zinc-200 font-bold block">{proj.name}</strong>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block line-clamp-1">{proj.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="ats-tab"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col gap-4 text-left"
                        >
                          {/* ATS Score Overview Grid */}
                          <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-2xl">
                            {/* Score Ring */}
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle className="text-slate-200 dark:text-zinc-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                <circle 
                                  className="text-indigo-600 dark:text-indigo-400" 
                                  strokeWidth="10" 
                                  strokeDasharray={`${251 * ((resumeData.ats_score || 70) / 100)} 251`} 
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="40" 
                                  cx="50" 
                                  cy="50" 
                                />
                              </svg>
                              <div className="absolute text-sm font-black text-slate-900 dark:text-white">
                                {resumeData.ats_score || 70}%
                              </div>
                            </div>
                            <div className="text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">ATS Optimizer</span>
                              <strong className="text-xs text-slate-800 dark:text-zinc-200 mt-1 block leading-relaxed font-semibold">
                                {resumeData.ats_score >= 80 ? 'Highly Compatible!' : resumeData.ats_score >= 60 ? 'Decent, but needs tuning.' : 'Needs major improvements.'}
                              </strong>
                            </div>
                          </div>

                          {/* Section Grades */}
                          {resumeData.ats_analysis?.grades && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Section Grades</span>
                              <div className="grid grid-cols-3 gap-2">
                                {Object.entries(resumeData.ats_analysis.grades).map(([section, grade]) => (
                                  <div key={section} className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/60 p-2 rounded-xl text-center flex flex-col justify-between items-center">
                                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate w-full" title={section.replace('_', ' ')}>
                                      {section.replace('_', ' ')}
                                    </span>
                                    <span className={`text-xs font-black mt-1 ${
                                      grade.startsWith('A') ? 'text-emerald-500' : grade.startsWith('B') ? 'text-amber-500' : 'text-slate-500'
                                    }`}>
                                      {grade}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Optimization suggestions checklist */}
                          {resumeData.ats_analysis?.suggestions && resumeData.ats_analysis.suggestions.length > 0 && (
                            <div className="flex flex-col gap-2 text-left">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Audit Recommendations</span>
                              <ul className="space-y-1.5">
                                {resumeData.ats_analysis.suggestions.map((sug, i) => (
                                  <li key={i} className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                    <span className="text-indigo-500 shrink-0 mt-0.5">💡</span>
                                    <span>{sug}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-black/5"
                  >
                    <span>Back to Dashboard</span> <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center min-h-[440px] shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900/30 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-zinc-800/30">
                  <FileText size={28} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">No reference profile yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs">
                  Upload your CV or resume on the left. The AI agent will extract your active profile stats to calibrate custom mock interview questions.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gap Analysis Section */}
      <AnimatePresence mode="wait">
        {resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mt-4"
          >
            <div className="bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">JD Match & Gap Analysis</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Paste a target job description below to analyze how well your active resume matches the requirements.
              </p>
              
              <div className="flex flex-col gap-4">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste Job Description here..."
                  className="w-full min-h-[120px] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={handleGapAnalysis}
                    disabled={gapLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gapLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Analyzing Gap...
                      </>
                    ) : (
                      "Analyze Fit"
                    )}
                  </button>
                </div>
                
                {gapResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle className="text-slate-200 dark:text-zinc-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                            <circle 
                              className={gapResult.match_score > 75 ? "text-emerald-500" : gapResult.match_score > 50 ? "text-amber-500" : "text-rose-500"} 
                              strokeWidth="8" strokeDasharray={`${251 * (gapResult.match_score / 100)} 251`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" 
                            />
                          </svg>
                          <div className="absolute text-xl font-black text-slate-900 dark:text-white">
                            {gapResult.match_score}%
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-2">Match Score</span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mb-2">Key Strengths</strong>
                          <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1">
                            {gapResult.key_strengths?.map((str, i) => (
                              <li key={i} className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span> <span>{str}</span></li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block mb-2">Missing Skills</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {gapResult.missing_skills?.map((skill, i) => (
                              <span key={i} className="text-xs font-medium bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-2.5 py-0.5 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="md:col-span-2 bg-white dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-700">
                          <strong className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block mb-1">Recommendation</strong>
                          <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {gapResult.recommendations}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Upload;
