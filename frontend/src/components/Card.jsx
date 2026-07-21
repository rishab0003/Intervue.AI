import React, { useRef, useState } from 'react';

export const Card = ({
  children,
  className = '',
  topAccent = false,
  onClick,
  style = {}
}) => {
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

  // Only apply default surface bg/border if caller didn't provide their own
  const hasCustomBg   = /\bbg-(?!bg-base\b)/.test(className);
  const hasCustomBorder = /\bborder-(?!\s)/.test(className);

  const baseBg     = hasCustomBg     ? '' : 'surface border';
  const baseBorder = hasCustomBorder ? '' : '';

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onClick={onClick}
      style={style}
      className={`
        rounded-3xl p-6 shadow-sm
        transition-all duration-300 relative overflow-hidden backdrop-blur-xl
        ${baseBg}
        ${baseBorder}
        ${topAccent ? 'border-t-4 border-t-accent' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:translate-y-[-2.5px]' : ''}
        ${className}
      `}
    >
      {/* React Bits Hover Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.10), transparent 80%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
export default Card;
