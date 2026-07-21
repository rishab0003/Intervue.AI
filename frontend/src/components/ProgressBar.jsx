import React from 'react';

export const ProgressBar = ({
  value = 0, // 0 to 100
  max = 100,
  color = 'accent', // 'accent' | 'success' | 'focus-area'
  className = '',
  height = 'h-3'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'bg-success';
      case 'focus-area':
        return 'bg-focus-area';
      case 'accent':
      default:
        return 'bg-accent';
    }
  };

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClass()}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
export default ProgressBar;
