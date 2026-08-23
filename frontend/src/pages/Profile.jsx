import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { User, Lock, Mail, ArrowRight, ShieldCheck, Briefcase, GraduationCap, Target, CheckCircle2, LogOut, Sparkles, Key, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, token, logout, loginUser, showToast } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [targetDomain, setTargetDomain] = useState("Software Engineering");
  const [graduationDate, setGraduationDate] = useState("");
  const [weeklyPracticeGoal, setWeeklyPracticeGoal] = useState(3);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setTargetDomain(user.target_domain || "Software Engineering");
    setGraduationDate(user.graduation_date || "");
    setWeeklyPracticeGoal(user.weekly_practice_goal || 3);
  }, [user]);

  // Compute initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    if (pwd.length < 6) return { score: 1, label: "Too Short", color: "bg-rose-500 text-rose-500" };
    if (pwd.length < 9) return { score: 2, label: "Medium", color: "bg-amber-500 text-amber-500" };
    return { score: 3, label: "Strong ✓", color: "bg-emerald-500 text-emerald-500" };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    // Password validation logic
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMsg("Please enter your current password to make password changes.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirm password do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        full_name: fullName,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        target_domain: targetDomain,
        graduation_date: graduationDate,
        weekly_practice_goal: weeklyPracticeGoal
      };

      const { data, error } = await api.updateProfile(payload);

      if (error) {
        setErrorMsg(error);
        showToast(error, "error");
        setLoading(false);
        return;
      }

      // Update local storage and context state with new user info
      loginUser(data.user, token);
      showToast("Profile updated successfully! 🎉", "success");

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate("/");
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8 text-left relative z-10"
    >
      {/* Header Banner & Save Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
        <div>
          <div className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.25em] mb-1">
            Account Preferences
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profile & Security Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50 mt-1">
            Manage your personal profile, career track targets, and account security.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={16} /> Save Profile Changes
            </>
          )}
        </button>
      </div>

      {/* User Header Profile Card Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 dark:from-indigo-950/40 dark:via-violet-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30 ring-4 ring-white dark:ring-zinc-900">
              {getInitials(fullName)}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-white font-bold" title="Active">
              ✓
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{fullName || "Candidate"}</h2>
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Candidate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50 font-medium">{email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> Verified Account
              </span>
              <span className="text-[10px] text-slate-400 dark:text-white/30">• {targetDomain}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex gap-3 text-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-white/10">
          <div className="px-3 border-r border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-white/40 uppercase tracking-widest block">Goal</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{weeklyPracticeGoal} reps/wk</span>
          </div>
          <div className="px-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-white/40 uppercase tracking-widest block">Status</span>
            <span className="text-sm font-extrabold text-emerald-500">Active</span>
          </div>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold animate-shake">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols): Personal Info & Career Goals */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* CARD 1: Personal Information */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-5 text-left shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal Identity</h3>
                <p className="text-[11px] text-slate-500 dark:text-white/40">Your name and verified login credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400 dark:text-white/30" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                    Email Address
                  </label>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">Verified ✓</span>
                </div>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-slate-400 dark:text-white/30" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-zinc-850/50 border border-slate-200/70 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                  />
                  <Lock size={14} className="absolute right-3.5 text-slate-400" title="Email cannot be changed" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Target Career Track & Practice Goals */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-5 text-left shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Career Track & Practice Target</h3>
                <p className="text-[11px] text-slate-500 dark:text-white/40">Align interview difficulty and session reminders with your target role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Target Domain */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                  Career Specialization
                </label>
                <select
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Software Engineering">🧑‍💻 Software Engineering</option>
                  <option value="Product Management">🗂️ Product Management</option>
                  <option value="Data Science">🤖 Data Science & AI</option>
                  <option value="UI/UX Design">🎨 UI/UX Design</option>
                  <option value="Finance & Consulting">📊 Finance & Consulting</option>
                  <option value="General Preparation">🎯 General Interview Preparation</option>
                </select>
              </div>

              {/* Graduation Target Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                  Target Hiring / Graduation Date
                </label>
                <input
                  type="month"
                  value={graduationDate}
                  onChange={(e) => setGraduationDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Weekly Practice Goal Pills */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                  <Target size={13} className="text-indigo-500" /> Weekly Practice Target (Sessions / Week)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{weeklyPracticeGoal} Reps / Week</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeklyPracticeGoal(num)}
                    className={`py-3 px-3 rounded-2xl text-xs font-extrabold transition-all text-center select-none cursor-pointer border ${
                      weeklyPracticeGoal === num
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    {num} Reps
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Security & Account Management */}
        <div className="flex flex-col gap-6 lg:col-span-1">

          {/* CARD 3: Password Management */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-5 text-left shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Key size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-[11px] text-slate-500 dark:text-white/40">Update your account authentication credentials</p>
              </div>
            </div>

            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                  New Password
                </label>
                {newPassword && (
                  <span className={`text-[10px] font-extrabold ${pwdStrength.color.split(' ')[1]}`}>
                    {pwdStrength.label}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {/* Strength Meter Bar */}
              {newPassword && (
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3].map(step => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        step <= pwdStrength.score ? pwdStrength.color.split(' ')[0] : 'bg-slate-200 dark:bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/40">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* CARD 4: Account Session & Quick Actions */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-left shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-white/40 uppercase tracking-widest">Quick Actions</h4>
            
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Back to Dashboard</span> <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={14} /> Sign Out of Account
            </button>
          </div>

        </div>

      </form>
    </motion.div>
  );
}
