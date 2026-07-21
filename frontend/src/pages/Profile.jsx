import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { User, Lock, Mail, ArrowRight, ShieldCheck, Briefcase, GraduationCap, Target } from "lucide-react";

export default function Profile() {
  const { user, token, loginUser, showToast } = useApp();
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
      showToast("Profile settings updated successfully! 🎉", "success");

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

  return (
    <div className="flex-1 max-w-xl mx-auto w-full px-4 py-8 flex flex-col gap-6 relative z-10 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Manage your personal account profile details, career tracks, and security.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Mail size={10} /> Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4.5 py-3 rounded-xl bg-slate-100 dark:bg-zinc-850/50 border border-slate-200/60 dark:border-zinc-800/80 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
              />
              <span className="absolute right-3.5 top-3 text-slate-400" title="Email cannot be changed">
                <Lock size={12} />
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fullName" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <User size={10} /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full px-4.5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Target Specialization / Domain */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="targetDomain" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Briefcase size={10} /> Target Career Specialization
            </label>
            <select
              id="targetDomain"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="Product Management">Product Management</option>
              <option value="Data Science">Data Science</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Finance & Consulting">Finance & Consulting</option>
              <option value="General Preparation">General Preparation</option>
            </select>
          </div>

          {/* Graduation Target Date */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="graduationDate" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap size={10} /> Graduation Target (Month/Year)
            </label>
            <input
              id="graduationDate"
              type="month"
              value={graduationDate}
              onChange={(e) => setGraduationDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Weekly Practice Goal */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Target size={10} /> Weekly Sessions Target
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setWeeklyPracticeGoal(num)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center select-none cursor-pointer ${
                    weeklyPracticeGoal === num
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  {num} reps
                </button>
              ))}
            </div>
          </div>

          {/* Password divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800/60"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={11} /> Password Management
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800/60"></div>
          </div>

          {/* Current Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="currentPassword" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4.5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* New Password & Confirm Password grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="newPassword" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4.5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4.5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-indigo-600/10 cursor-pointer select-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-black/5 cursor-pointer select-none"
            >
              <span>Back to Dashboard</span> <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
