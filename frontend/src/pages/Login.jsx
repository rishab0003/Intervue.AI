import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Cpu,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Mic,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

/**
 * Intervue AI — Login page.
 * Restructured with active API handlers, OAuth checks, and an adaptive light/dark layout.
 * Left: kinetic telemetry stage.
 * Right: glass card with 3D tilt interaction.
 */
export default function Login() {
  const { loginUser, showToast, darkMode } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 3D tilt values for the login card
  const cardRef = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), {
    stiffness: 120,
    damping: 15,
  });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), {
    stiffness: 120,
    damping: 15,
  });

  // Handle OAuth Redirect Callbacks
  useEffect(() => {
    const getParam = (key) => {
      return searchParams.get(key) || new URLSearchParams(window.location.search).get(key);
    };

    const token = getParam('token');
    const userStr = getParam('user');
    const error = getParam('error');

    if (error) {
      setErrorMsg(error === 'auth_failed' ? 'Social login failed. Please try again.' : 'An error occurred during authentication.');
      showToast('Authentication failed', 'error');
    }

    if (token && userStr) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userStr));
        loginUser(decodedUser, token);
        showToast(`Successfully logged in! Welcome back 🎉`, 'success');
        
        // Immediately clean the URL parameters to prevent re-triggering this effect
        window.history.replaceState({}, document.title, window.location.pathname);
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to parse user profile', err);
      }
    }
  }, [searchParams, loginUser, navigate, showToast]);

  const onCardMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const onCardLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await api.login(email, password);
      if (error) {
        setErrorMsg(error);
        showToast(error, 'error');
        setLoading(false);
        return;
      }

      loginUser(data.user, data.token);
      showToast(`Welcome back, ${data.user.full_name}! 🎉`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Cannot connect to server. Make sure backend is running.');
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    const origin = window.location.origin;
    window.location.href = `/api/auth/${provider}?origin=${encodeURIComponent(origin)}`;
  };

  return (
    <main
      data-testid="login-root"
      className="relative min-h-screen lg:h-screen lg:overflow-hidden bg-[#FAFAF7] dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors flex flex-col justify-between"
    >
      {/* Global aura background */}
      <BackgroundStage darkMode={darkMode} />

      {/* Top-left brand + back */}
      <div className="relative z-20 flex-none flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link
          to="/"
          data-testid="brand-mark"
          className="group flex items-center gap-2.5"
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-indigo-500/40 blur-md" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="absolute h-6 w-6 rounded-full border border-indigo-500/30" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            intervue<span className="text-indigo-600 dark:text-indigo-400 font-bold-display">.ai</span>
          </span>
        </Link>
        <div className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-white/40 sm:block">
          Secure Sign-in · v1.0
        </div>
      </div>

      {/* Two-column layout */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-6 lg:grid-cols-12 lg:gap-16 lg:px-10 flex-1 w-full overflow-y-auto lg:overflow-hidden">
        {/* LEFT — kinetic stage */}
        <section className="hidden lg:col-span-6 lg:block">
          <LeftStage />
        </section>

        {/* RIGHT — login card */}
        <section className="relative lg:col-span-6">
          <motion.div
            ref={cardRef}
            onMouseMove={onCardMove}
            onMouseLeave={onCardLeave}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            {/* Card ambient glow */}
            <div className="absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-indigo-500/15 dark:from-indigo-500/25 via-transparent to-emerald-400/10 dark:to-emerald-400/15 blur-2xl opacity-60 dark:opacity-100" />

            <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0F1524]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_30px_100px_-20px_rgba(15,23,42,0.08)] dark:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] transition-all">
              {/* Welcome */}
              <div className="text-center">
                <h1
                  data-testid="login-title"
                  className="inline-flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
                >
                  Welcome Back!
                  <Sparkles size={22} className="text-indigo-500 dark:text-indigo-300" />
                </h1>
                <p className="mt-1 text-[13.5px] text-slate-500 dark:text-white/55">
                  Sign in to resume mock training
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
                <Field
                  label="Email address"
                  testId="email-field"
                >
                  <input
                    data-testid="email-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="peer w-full bg-transparent px-4 py-2.5 text-[14px] text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  />
                </Field>

                <Field label="Password" testId="password-field">
                  <input
                    data-testid="password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="peer w-full bg-transparent px-4 py-2.5 pr-11 text-[14px] text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    data-testid="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                {/* Validation alert */}
                {errorMsg && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-350 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 leading-relaxed">
                    <ShieldAlert size={14} className="flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Row: remember + forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    data-testid="remember-me"
                    className="group flex cursor-pointer select-none items-center gap-2.5"
                  >
                    <span
                      className={[
                        "grid h-4 w-4 place-items-center rounded-[5px] border transition-colors",
                        remember
                          ? "border-indigo-500 bg-indigo-650 dark:bg-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.3)]"
                          : "border-slate-300 dark:border-white/25 bg-slate-50 dark:bg-white/[0.03] group-hover:border-slate-400 dark:group-hover:border-white/40",
                      ].join(" ")}
                      onClick={() => setRemember((v) => !v)}
                    >
                      <AnimatePresence>
                        {remember && (
                          <motion.svg
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M1.5 5.2 3.8 7.5 8.5 2.8"
                              stroke="white"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </span>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="sr-only"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-white/60">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#forgot"
                    data-testid="forgot-link"
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-white/60 transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Forgot?
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  data-testid="login-submit"
                  disabled={loading}
                  className="group relative mt-2 w-full overflow-hidden rounded-full bg-slate-950 dark:bg-white hover:opacity-90 py-3.5 text-[14px] font-semibold text-white dark:text-slate-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-80 cursor-pointer border border-slate-900/10 dark:border-white/10"
                >
                  {/* Sweep highlight */}
                  <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
                  <span className="relative inline-flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 dark:border-slate-900/40 border-t-white dark:border-t-slate-900" />
                        Signing in
                      </>
                    ) : (
                      "Log in"
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                  <span className="mx-3 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-white/40">
                    Or
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                </div>

                {/* OAuth */}
                <div className="grid grid-cols-2 gap-3">
                  <OAuthButton testId="oauth-google" label="Google" onClick={() => handleOAuth('google')}>
                    <GoogleGlyph />
                  </OAuthButton>
                  <OAuthButton
                    testId="oauth-github"
                    label="GitHub"
                    variant="github-brand"
                    onClick={() => handleOAuth('github')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.22.585.82.47C20.562 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </OAuthButton>
                </div>

                {/* Create one */}
                <p className="pt-4 text-center text-[13px] text-slate-500 dark:text-white/55">
                  Don&rsquo;t have an account?{" "}
                  <Link
                    to="/register"
                    data-testid="signup-link"
                    className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-200"
                  >
                    Create one
                  </Link>
                </p>

                {/* Back to info */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => navigate("/landing")}
                    data-testid="back-to-info"
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Back to info
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Bottom hairline meta */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between px-6 pb-4 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-white/30 flex-none">
        <span>Auth · 128-bit</span>
        <span className="hidden sm:block">
          <Mic size={11} className="inline -mt-0.5 mr-1 text-indigo-600 dark:text-indigo-400" /> Voice-first · No cloud recording
        </span>
        <span>Session · Local only</span>
      </div>
    </main>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

function Field({ label, children, testId }) {
  return (
    <label data-testid={testId} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-white/45">
        {label}
      </span>
      <div className="relative mt-1.5 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19]/80 transition-colors focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
        {children}
      </div>
    </label>
  );
}

function OAuthButton({ children, label, testId, variant = "google-brand", onClick }) {
  const styles =
    variant === "github-brand"
      ? "bg-slate-950 dark:bg-white text-white dark:text-[#0B0F19] hover:opacity-90"
      : "bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04]";
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center justify-center gap-2 rounded-full py-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] transition-all cursor-pointer ${styles}`}
    >
      {children}
      {label}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-5.84-4.53z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

function ChipAvatar() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-3xl bg-indigo-500/25 blur-2xl" />
      <motion.div
        initial={{ rotate: -6, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 dark:bg-gradient-to-b dark:from-white/[0.14] dark:to-white/[0.04] backdrop-blur-xl ring-1 ring-slate-200 dark:ring-white/15"
      >
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        {/* Status dot */}
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white dark:bg-[#0F1524]"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_10px_2px_rgba(99,102,241,0.7)]" />
        </motion.span>
      </motion.div>
    </div>
  );
}

/* --------------------------- Left kinetic stage -------------------------- */

function LeftStage() {
  const lines = ["MOCK.", "REP.", "REPEAT."];
  return (
    <div className="relative text-left">
      {/* Chapter marker */}
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-white/40">
        §00 · Return
      </div>

      {/* Big kinetic type */}
      <div className="mt-6 font-display text-[9vw] font-black leading-[0.9] tracking-[-0.04em] text-slate-900 dark:text-white lg:text-[6vw] uppercase font-bold-display">
        {lines.map((l, i) => (
          <div key={l} className="overflow-hidden pb-[0.06em]">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.95,
                delay: 0.15 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block"
            >
              {i === 2 ? (
                <span>
                  <span className="font-serif italic lowercase text-blue-600 dark:text-indigo-300 font-normal">
                    repeat.
                  </span>
                </span>
              ) : (
                l
              )}
            </motion.span>
          </div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 max-w-md text-[14.5px] leading-relaxed text-slate-500 dark:text-white/60 font-medium"
      >
        Your practice room is warm. The mic is calibrated, the transcript is
        waiting. Sign in and pick up exactly where the last rep ended.
      </motion.p>

      {/* Mini telemetry card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 grid max-w-md grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 backdrop-blur shadow-sm"
      >
        {[
          { k: "07:24:11", u: "Last session" },
          { k: "82%", u: "Cadence score" },
          { k: "Frontend", u: "Track" },
        ].map((s) => (
          <div key={s.u} className="px-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
              {s.u}
            </div>
            <div className="mt-1 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {s.k}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Live waveform strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 backdrop-blur shadow-sm"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-white/50">
          Mic
        </span>
        <div className="flex flex-1 items-end gap-[3px]">
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className="wave-bar block w-[3px] rounded-full bg-indigo-500 dark:bg-indigo-300/80"
              style={{
                height: `${8 + (i % 6) * 3}px`,
                animationDelay: `${(i % 7) * 0.08}s`,
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-350/80">
          Ready
        </span>
      </motion.div>
    </div>
  );
}

/* ------------------------- Background aura + grid ------------------------ */

function BackgroundStage({ darkMode }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
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
      {/* Auras */}
      <div className="aura float-slow left-[-15%] top-[-10%] h-[520px] w-[520px] bg-indigo-500/10 dark:bg-indigo-600/40" style={{ filter: 'blur(120px)', borderRadius: '9999px', position: 'absolute' }} />
      <div
        className="aura float-slow right-[-10%] bottom-[-10%] h-[500px] w-[500px] bg-emerald-500/10 dark:bg-emerald-500/25"
        style={{ animationDelay: "-5s", filter: 'blur(120px)', borderRadius: '9999px', position: 'absolute' }}
      />
      <div
        className="aura float-slow left-[35%] bottom-[10%] h-[420px] w-[420px] bg-amber-400/5 dark:bg-amber-400/15"
        style={{ animationDelay: "-9s", filter: 'blur(100px)', borderRadius: '9999px', position: 'absolute' }}
      />
    </div>
  );
}
