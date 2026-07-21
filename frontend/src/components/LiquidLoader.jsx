import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LiquidLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fast loading: 1.2 seconds total
    const duration = 1200;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Smooth easing
      const t = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - t, 3);
      const nextProgress = Math.min(100, Math.round(easeOut * 100));
      
      setProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 150); // very short pause at 100%
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      {/* The Centered Rounded Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl aspect-[16/9] md:aspect-[2/1] bg-[#111111] rounded-[2rem] shadow-2xl flex flex-col items-center justify-center overflow-hidden relative border border-white/5"
      >
        <div className="relative flex flex-col items-end scale-90 md:scale-100">
          {/* The Text Container */}
          <div className="relative text-[10vw] md:text-[7rem] font-black tracking-tighter uppercase font-bold-display leading-none select-none">
            {/* Base Layer: Dark Gray */}
            <div className="text-[#2a2a2a]">
              INTERVUE.AI
            </div>

          {/* Liquid Wave Overlay Layer */}
          <div 
            className="absolute top-0 left-0 w-full h-full liquid-text-mask"
            style={{ 
              '--bg-y': `${progress}%` 
            }}
          >
            INTERVUE.AI
          </div>
        </div>

        {/* Loading Counter */}
        <div className="mt-2 text-[#666666] text-xs md:text-sm font-bold tracking-widest uppercase font-mono mr-2">
          loading... {progress} %
        </div>
      </div>
      </motion.div>

      <style jsx="true">{`
        .liquid-text-mask {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Cpath d='M0,500 C150,450 350,550 500,500 C650,450 850,550 1000,500 L1000,1000 L0,1000 Z' fill='%23ffffff'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          /* 50% width means 2 waves per screen width. 200% height means wave is exactly at H when pos-y is 0%, and at 0 when pos-y is 100% */
          background-size: 50% 200%;
          
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          
          animation: liquidWave 1.5s linear infinite;
          background-position-y: var(--bg-y);
        }

        @keyframes liquidWave {
          0% { background-position-x: 0%; }
          100% { background-position-x: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LiquidLoader;
