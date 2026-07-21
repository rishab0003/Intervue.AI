import React, { useRef, useState } from 'react';

export const SpotlightCard = ({ children, className = '', onClick, ...props }) => {
  const divRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl p-6 shadow-sm shadow-slate-200/30 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:translate-y-[-2.5px] hover:bg-white/80' : ''
      } ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.12), transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default SpotlightCard;
