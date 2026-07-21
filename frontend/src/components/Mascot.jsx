import React from 'react';
import { motion } from 'framer-motion';

export const Mascot = ({ pose = 'neutral', className = '', size = 50 }) => {
  const getPoseImage = () => {
    switch (pose) {
      case 'celebrate': return '/mascot-celebrate.png';
      case 'encourage': return '/mascot-encourage.png';
      case 'thinking':  return '/mascot-thinking.png';
      case 'neutral':
      default:          return '/mascot-neutral.png';
    }
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.img
        src={getPoseImage()}
        alt={`AI Mascot (${pose})`}
        className="w-full h-full object-contain filter drop-shadow-sm"
        animate={
          pose === 'celebrate' ? { y: [-3, 3, -3] } :
          pose === 'encourage' ? { scale: [1, 1.04, 1] } :
          pose === 'neutral' ? { y: [-2, 2, -2] } : {}
        }
        transition={{ repeat: Infinity, duration: pose === 'celebrate' ? 1.5 : 3, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default Mascot;
