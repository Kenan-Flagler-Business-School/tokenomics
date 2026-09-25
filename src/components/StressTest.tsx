import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StressFlags } from '../calculations';
import type { StressTestResult } from '../types';
import { fmt } from '../utils/formatting';

interface Props {
  flags: StressFlags;
  results: StressTestResult[];
  onToggle: (key: keyof StressFlags) => void;
  professorMode: boolean;
}

const STRESS_OPTIONS: { key: keyof StressFlags; label: string; desc: string }[] = [
  { key: 'doubleUserGrowth', label: '2× User Growth', desc: 'Users and growth rate doubled' },
  { key: 'computeCostPlus50', label: '+50% Compute Costs', desc: 'GPU, image gen, and agent costs up 50%' },
  { key: 'tokenUnlock30', label: '30% Token Unlock', desc: 'Accelerated emissions and treasury releases' },
  { key: 'tokenUsageMinus20', label: '−20% Token Usage', desc: 'Token adoption and AXM per user reduced 20%' },
  { key: 'doubleVelocity', label: '2× Token Velocity', desc: 'Velocity doubled (faster turnover)' },
  { key: 'enterpriseMinus50', label: '−50% Enterprise', desc: 'Enterprise percentage and contracts halved' },
];

function ChangeArrow({ pct, unit }: { pct: number; unit: string }) {
  const isUp = pct > 0.5;
  const isDown = pct < -0.5;
  const isPositive = unit === '%' ? isUp : isUp;
  const label = fmt.changePct(pct) + (unit === '%' ? ' pp' : '');

  if (isUp) {
    return (
      <span className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        <TrendingUp size={13} />{label}
      </span>
    );
  }
  if (isDown) {
    return (
      <span className="flex items-center gap-1 text-red-600 font-semibold">
        <TrendingDown size={13} />{label}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-slate-400 font-medium">
      <Minus size={13} />{label}
    </span>
  );
}

function formatValue(val: number, unit: string): string {
  if (unit === '$') return fmt.usdShort(val);
  if (unit === '%') return fmt.pct(val);
  if (unit === 'AXM') return fmt.compact(val);
  if (unit === 'mo') return val >= 999 ? '∞ mo' : `${Math.round(val)} mo`;
  return val.toFixed(2);
}

export const StressTest: React.FC<Props> = ({ flags, results, onToggle, professorMode }) => {
  const activeCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Toggle one or more stress factors to see how combined shocks affect key platform metrics.
        Results show baseline vs. stressed values and the percentage change.
      </p>

      {/* Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Active Stress Factors
          {activeCount > 0 && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{activeCount} active</span>
          )}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRESS_OPTIONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                flags[key]
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div
                  className={`w-4 h-4 rounded flex-shrink-0 border-2 transition-all mt-0.5 ${
                    flags[key] ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Stress Test Results
            {activeCount === 0 && <span className="ml-2 text-xs text-slate-400 font-normal">(no factors active — showing baseline)</span>}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
              <th className="text-left p-3 font-medium">Metric</th>
              <th className="text-right p-3 font-medium">Baseline</th>
              <th className="text-right p-3 font-medium">Stressed</th>
              <th className="text-right p-3 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.label} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-700">{r.label}</td>
                <td className="p-3 text-right font-mono text-slate-500">{formatValue(r.baseline, r.unit)}</td>
                <td className={`p-3 text-right font-mono font-semibold ${
                  r.stressed > r.baseline ? 'text-emerald-700' :
                  r.stressed < r.baseline ? 'text-red-700' : 'text-slate-700'
                }`}>
                  {formatValue(r.stressed, r.unit)}
                </td>
                <td className="p-3 text-right">
                  <ChangeArrow pct={r.changePct} unit={r.unit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {professorMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
          <div className="font-semibold">Teaching Notes — Stress Testing</div>
          <p>Discussion prompts for the classroom:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Which single stress factor has the largest impact on treasury runway?</li>
            <li>Under what combination of shocks does the platform become unsustainable?</li>
            <li>Why might higher user growth simultaneously improve and stress the model?</li>
            <li>What real-world analogs exist for a 50% increase in compute costs? (e.g. GPU supply constraints, model complexity increase)</li>
          </ul>
        </div>
      )}
    </div>
  );
};
