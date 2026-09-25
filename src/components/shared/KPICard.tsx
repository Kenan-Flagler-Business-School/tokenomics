import React from 'react';
import { Info } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  tooltip?: string;
  accent?: 'blue' | 'purple' | 'green' | 'amber' | 'slate';
  size?: 'sm' | 'md';
}

const accentMap = {
  blue: 'border-t-blue-500',
  purple: 'border-t-violet-500',
  green: 'border-t-emerald-500',
  amber: 'border-t-amber-500',
  slate: 'border-t-slate-400',
};

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  sub,
  tooltip,
  accent = 'blue',
  size = 'md',
}) => {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-t-4 ${accentMap[accent]} p-4 shadow-sm hover:shadow-md transition-shadow relative`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
        {tooltip && (
          <div className="relative flex-shrink-0">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Info size={13} />
            </button>
            {showTip && (
              <div className="absolute right-0 top-5 z-10 w-52 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`mt-1 font-semibold text-slate-800 ${size === 'sm' ? 'text-lg' : 'text-2xl'} font-mono tabular-nums`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
};
