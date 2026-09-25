import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  professorNote?: string;
  showProfessorNote?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  format,
  onChange,
  professorNote,
  showProfessorNote,
}) => {
  const displayValue = format ? format(value) : `${value.toLocaleString()}${unit}`;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs font-semibold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
          {displayValue}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-slate-400">{format ? format(min) : `${min}${unit}`}</span>
        <span className="text-[10px] text-slate-400">{format ? format(max) : `${max}${unit}`}</span>
      </div>
      {showProfessorNote && professorNote && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
          <strong className="font-medium">Note: </strong>{professorNote}
        </div>
      )}
    </div>
  );
};
