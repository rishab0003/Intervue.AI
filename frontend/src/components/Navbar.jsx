import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Sun, Moon, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, showToast, darkMode, toggleDarkMode } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      showToast('Logged out successfully! See you soon. 👋', 'info');
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Navbar: Logout failed", err);
    }
  };

  if (!user || location.pathname === '/landing') return null;

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
    return `px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold tracking-wider transition-all ${
      isActive
        ? 'text-blue-600 bg-indigo-50 border border-indigo-100/50 dark:text-white dark:bg-white/10 dark:border-white/5 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
    }`;
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 sticky top-0 z-50">
      <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-lg px-3.5 sm:px-5 h-14 sm:h-16 flex justify-between items-center text-slate-800 dark:text-white">
        
        {/* Left: Brand Circle Badge */}
        <Link 
          to="/dashboard" 
          className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-[#18181B] hover:scale-105 transition-transform shrink-0"
          title="Go to Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
        </Link>

        {/* Center Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
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
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-500" />}
          </button>

          <Link
            to="/profile"
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black px-5 h-10 rounded-full text-xs sm:text-sm font-black tracking-wide flex items-center justify-center transition-all shadow-sm select-none"
            title="Edit Profile"
          >
            <span>{user.full_name ? user.full_name.split(' ')[0] : 'Student'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-750 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
            title="Log Out"
          >
            <LogOut size={13.5} className="text-slate-600 dark:text-white" />
          </button>
        </div>

        {/* Mobile Nav Actions Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-8.5 h-8.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 dark:bg-white/10 dark:border-white/10 dark:text-white flex items-center justify-center cursor-pointer"
          >
            {darkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer"
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
            className="lg:hidden mt-2 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-xl flex flex-col gap-2 z-50 text-left"
          >
            <div className="grid grid-cols-2 gap-1.5 border-b border-slate-100 dark:border-white/5 pb-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:bg-slate-100'
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
                <User size={14} className="text-blue-500" />
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
