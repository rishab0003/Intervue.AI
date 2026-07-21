import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceOrb = ({ state = 'idle', className = '' }) => {
  // state can be: 'idle' | 'listening' | 'speaking' | 'thinking'

  const getGlowColor = () => {
    switch (state) {
      case 'listening':
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)'; // Emerald to Cyan
      case 'speaking':
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)'; // Indigo to Purple
      case 'thinking':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(239, 68, 68, 0.4) 100%)'; // Amber to Red
      case 'idle':
      default:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(165, 180, 252, 0.15) 100%)';
    }
  };

  const getOrbBackground = () => {
    switch (state) {
      case 'listening':
        return 'bg-emerald-500/10 dark:bg-emerald-500/5';
      case 'speaking':
        return 'bg-indigo-500/10 dark:bg-indigo-500/5';
      case 'thinking':
        return 'bg-amber-500/10 dark:bg-amber-500/5';
      case 'idle':
      default:
        return 'bg-white/70 dark:bg-white/5';
    }
  };

  const renderWaveform = () => {
    if (state !== 'speaking' && state !== 'listening') return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden rounded-full">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveGradEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Wave 1 */}
          <motion.path
            d="M 0 50 C 25 35, 75 65, 100 50 L 100 100 L 0 100 Z"
            fill={state === 'listening' ? 'url(#waveGradEmerald)' : 'url(#waveGradIndigo)'}
            animate={{
              d: state === 'speaking'
                ? [
                    "M 0 50 C 20 25, 80 75, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 30 65, 70 35, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 25 25, 75 75, 100 50 L 100 100 L 0 100 Z"
                  ]
                : [
                    "M 0 50 C 20 40, 80 60, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 30 55, 70 45, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 25 40, 75 60, 100 50 L 100 100 L 0 100 Z"
                  ]
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="opacity-35"
          />
          
          {/* Wave 2 */}
          <motion.path
            d="M 0 50 C 35 60, 65 40, 100 50 L 100 100 L 0 100 Z"
            fill={state === 'listening' ? 'url(#waveGradEmerald)' : 'url(#waveGradIndigo)'}
            animate={{
              d: state === 'speaking'
                ? [
                    "M 0 50 C 40 68, 60 32, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 20 32, 80 68, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 35 60, 65 40, 100 50 L 100 100 L 0 100 Z"
                  ]
                : [
                    "M 0 50 C 40 52, 60 48, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 20 48, 80 52, 100 50 L 100 100 L 0 100 Z",
                    "M 0 50 C 35 51, 65 49, 100 50 L 100 100 L 0 100 Z"
                  ]
            }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="opacity-45"
          />
          
          {/* Wave 3 (Top sharp indicator line) */}
          <motion.path
            d="M 0 50 Q 25 35 50 50 T 100 50"
            fill="none"
            stroke={state === 'listening' ? '#10B981' : '#8B5CF6'}
            strokeWidth="2"
            animate={{
              d: state === 'speaking'
                ? [
                    "M 0 50 Q 20 18 50 50 T 100 50",
                    "M 0 50 Q 30 82 50 50 T 100 50",
                    "M 0 50 Q 25 35 50 50 T 100 50"
                  ]
                : [
                    "M 0 50 Q 20 38 50 50 T 100 50",
                    "M 0 50 Q 30 62 50 50 T 100 50",
                    "M 0 50 Q 25 45 50 50 T 100 50"
                  ]
            }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`relative flex items-center justify-center w-full h-56 ${className}`}>
      {/* CSS Keyframes Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes morph-orb-glow {
          0% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
          50% { border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%; }
          100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
        }
        .fluid-glow-orb {
          animation: morph-orb-glow 8s ease-in-out infinite;
        }
      `}} />

      {/* Dynamic colorful aura mesh backlights */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute fluid-glow-orb blur-2xl opacity-70"
          style={{
            width: '210px',
            height: '210px',
            background: getGlowColor()
          }}
          animate={{
            scale: state === 'speaking' || state === 'listening' ? [1, 1.15, 1.02, 1.1, 1] : [1, 1.05, 1]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute fluid-glow-orb blur-3xl opacity-40 rotate-45"
          style={{
            width: '230px',
            height: '230px',
            background: getGlowColor()
          }}
          animate={{
            scale: state === 'speaking' || state === 'listening' ? [1, 1.05, 1.15, 0.98, 1] : [1, 1.02, 1]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
      </div>

      {/* Main minimal frosted voice container */}
      <motion.div
        className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-xl border border-black/5 dark:border-white/10 ${getOrbBackground()} backdrop-blur-2xl transition-colors duration-500`}
        animate={{
          scale: state === 'speaking' || state === 'listening' ? [1, 1.02, 0.99, 1.01, 1] : [1, 1.01, 1]
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {/* Thinking loader */}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg className="animate-spin h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Idle static mic icon */}
        {state === 'idle' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2 text-text-secondary select-none z-20"
          >
            <div className="p-3 bg-indigo-50 dark:bg-zinc-900 border border-indigo-100/50 dark:border-zinc-800 rounded-full text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Ready</span>
          </motion.div>
        )}

        {/* Listening / Speaking state visual label inside */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="absolute top-6 z-20 pointer-events-none select-none">
            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              state === 'listening' 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
            }`}>
              {state === 'listening' ? 'Listening' : 'Speaking'}
            </span>
          </div>
        )}

        {/* Dynamic active fluid waves */}
        {renderWaveform()}
      </motion.div>
    </div>
  );
};

export default VoiceOrb;
