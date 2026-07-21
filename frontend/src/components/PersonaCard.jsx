import React from 'react';
import Card from './Card';

export const PersonaCard = ({
  name,
  description,
  icon: IconComponent,
  selected = false,
  onClick,
  className = ''
}) => {
  return (
    <Card
      onClick={onClick}
      className={`
        border-2 transition-all duration-300 relative flex flex-col gap-3 p-5 rounded-3xl cursor-pointer
        ${selected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm' : 'border-slate-200/70 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
        ${className}
      `}
    >
      <div className={`p-3 rounded-2xl w-fit ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'}`}>
        <IconComponent size={22} />
      </div>
      <div>
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight font-bold-display">{name}</h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">{description}</p>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
          ✓
        </div>
      )}
    </Card>
  );
};
export default PersonaCard;
