import React, { useState, useMemo } from 'react';
import { computeSensitivityTable, type SensitivityVar } from '../calculations';
import { fmt } from '../utils/formatting';
import type { SimulationInputs } from '../types';

interface Props {
  inputs: SimulationInputs;
  professorMode: boolean;
}

const ROW_VARS: { value: SensitivityVar; label: string }[] = [
  { value: 'annualRevenue', label: 'Revenue Multiplier' },
  { value: 'userGrowth', label: 'User Growth Rate (%)' },
  { value: 'computeCost', label: 'Compute Cost Multiplier' },
  { value: 'tokenAdoption', label: 'Token Adoption (%)' },
  { value: 'circulatingSupply', label: 'Circulating Supply %' },
];

function getColor(value: number, min: number, max: number): string {
  if (max === min) return 'bg-slate-100 text-slate-700';
  const t = (value - min) / (max - min);
  if (t < 0.2) return 'bg-red-100 text-red-800';
  if (t < 0.4) return 'bg-orange-100 text-orange-800';
  if (t < 0.6) return 'bg-amber-100 text-amber-800';
  if (t < 0.8) return 'bg-emerald-100 text-emerald-800';
  return 'bg-green-200 text-green-900';
}

export const SensitivityAnalysis: React.FC<Props> = ({ inputs, professorMode }) => {
  const [rowVar, setRowVar] = useState<SensitivityVar>('annualRevenue');

  const table = useMemo(() => computeSensitivityTable(inputs, rowVar, 'annualRevenue'), [inputs, rowVar]);

  const allValues = table.flat().map(c => c.value).filter(v => isFinite(v) && !isNaN(v));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const velocityLabels = ['V=1×', 'V=2×', 'V=4×', 'V=6×', 'V=8×', 'V=12×'];

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Each cell shows the implied token price under a specific combination of assumptions.
        Rows represent different levels of the selected variable; columns represent different token velocities.
        This table is useful for understanding which assumptions most affect the model output.
      </p>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-medium text-slate-600">Row variable:</span>
        {ROW_VARS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRowVar(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rowVar === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Implied Token Price — {ROW_VARS.find(r => r.value === rowVar)?.label} vs Token Velocity
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Low</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block" /> Mid</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> High</span>
            </div>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-3 font-medium text-slate-500 w-36">
                {ROW_VARS.find(r => r.value === rowVar)?.label}
              </th>
              {velocityLabels.map((label) => (
                <th key={label} className="text-center p-3 font-medium text-slate-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-600">{row[0]?.rowLabel ?? ''}</td>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-2 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-md font-mono font-medium tabular-nums ${
                        getColor(cell.value, minVal, maxVal)
                      }`}
                    >
                      {isFinite(cell.value) && cell.value > 0 ? fmt.usd(cell.value, 3) : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {professorMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1.5">
          <div className="font-semibold">Teaching Notes — Sensitivity Analysis</div>
          <ul className="list-disc list-inside space-y-1">
            <li>The column axis (velocity) has a nonlinear inverse relationship with price: doubling velocity halves the implied price.</li>
            <li>This table illustrates which combinations of assumptions produce favorable or unfavorable outcomes for token holders.</li>
            <li>Discussion prompt: Which cells represent a scenario where token economics are sustainable for the platform?</li>
            <li>Note: all prices shown are model outputs under simplified assumptions — not market predictions.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
