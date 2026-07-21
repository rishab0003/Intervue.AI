import React from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  trendValue,
  trendDirection = 'up', // 'up' | 'down'
  className = ''
}) => {
  return (
    <Card className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-text-primary tracking-tight">{value}</span>
        {trendValue && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              trendDirection === 'up' 
                ? 'bg-emerald-50 text-success' 
                : 'bg-amber-50 text-focus-area'
            }`}
          >
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-text-secondary leading-normal">{subtitle}</p>}
    </Card>
  );
};
export default MetricCard;
