import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Sun, Moon, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, showToast, darkMode, toggleDarkMode } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLiveSession, setIsLiveSession] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsLiveSession(!!document.fullscreenElement);
    };
    const handleInterviewStateChange = (e) => {
      if (e.detail?.isLive !== undefined) {
        setIsLiveSession(e.detail.isLive);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('interviewStateChange', handleInterviewStateChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('interviewStateChange', handleInterviewStateChange);
    };
  }, []);

  const handleLogout = () => {
    try {
      logout();
      showToast('Logged out successfully! See you soon. 👋', 'info');
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Navbar: Logout failed", err);
    }
  };

  if (!user || location.pathname === '/landing' || (location.pathname === '/interview' && isLiveSession)) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/courses', label: 'Courses' },
    { path: '/interview', label: 'Interview' },
    { path: '/history', label: 'Sessions' },
    { path: '/settings', label: 'Setup' },
    { path: '/upload', label: 'Resume' },
  ];

  const pillClass = (path) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold tracking-wider transition-all backdrop-blur-md ${
      isActive
        ? 'text-indigo-600 bg-indigo-600/10 border border-indigo-500/20 dark:text-white dark:bg-white/15 dark:border-white/25 shadow-xs scale-105'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10'
    }`;
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 sticky top-0 z-50">
      <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-full border border-white/60 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] px-3.5 sm:px-5 h-14 sm:h-16 flex justify-between items-center text-slate-800 dark:text-white transition-all">
        
        {/* Left: Brand Circle Badge */}
        <Link 
          to="/dashboard" 
          className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white/10 dark:border dark:border-white/20 dark:backdrop-blur-md flex items-center justify-center text-white dark:text-white hover:scale-105 transition-transform shrink-0 shadow-md"
          title="Go to Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
        </Link>

        {/* Center Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={pillClass(item.path)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/80 dark:border-white/15 backdrop-blur-md text-slate-700 dark:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-xs"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-500" />}
          </button>

          <Link
            to="/profile"
            className="bg-slate-900/90 hover:bg-slate-900 text-white dark:bg-white/15 dark:hover:bg-white/25 dark:border dark:border-white/20 dark:text-white backdrop-blur-md px-5 h-10 rounded-full text-xs sm:text-sm font-black tracking-wide flex items-center justify-center transition-all shadow-xs select-none"
            title="Edit Profile"
          >
            <span>{user.full_name ? user.full_name.split(' ')[0] : 'Student'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/80 dark:border-white/15 backdrop-blur-md text-slate-750 dark:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-xs"
            title="Log Out"
          >
            <LogOut size={14} className="text-slate-600 dark:text-white" />
          </button>
        </div>

        {/* Mobile Nav Actions Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 backdrop-blur-md text-slate-700 dark:text-white flex items-center justify-center cursor-pointer"
          >
            {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9.5 h-9.5 rounded-full bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/15 backdrop-blur-md text-slate-800 dark:text-white flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Modal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-white/15 rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex flex-col gap-2 z-50 text-left"
          >
            <div className="grid grid-cols-2 gap-1.5 border-b border-slate-100 dark:border-white/5 pb-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors backdrop-blur-md ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/50 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-white/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white px-2 py-1.5"
              >
                <User size={14} className="text-indigo-500" />
                <span>Profile ({user.full_name ? user.full_name.split(' ')[0] : 'Account'})</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                <LogOut size={12} /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
