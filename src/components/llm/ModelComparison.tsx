import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { CALCULATOR_PRESETS } from '../../data/examples';
import { AlertCircle } from 'lucide-react';

function fmtCost(v: number): string {
  if (v < 0.0001) return '<$0.0001';
  if (v < 1) return `$${v.toFixed(4)}`;
  if (v < 1000) return `$${v.toFixed(2)}`;
  return `$${(v / 1000).toFixed(1)}K`;
}

export const ModelComparison: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(['claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-5-5', 'gpt-6-luna', 'gpt-6-sol', 'gpt-6-astra'])
  );
  const [inputTokens, setInputTokens] = useState(25000);
  const [outputTokens, setOutputTokens] = useState(4000);

  const toggleModel = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const selected = MODELS.filter((m) => selectedIds.has(m.id));

  const costs = useMemo(() =>
    selected.map((m) => ({ model: m, ...calcCost(m, inputTokens, outputTokens) })),
    [selected, inputTokens, outputTokens]
  );

  const maxTotal = Math.max(...costs.map((c) => c.total), 0.0001);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Compare Models</h2>
        <p className="text-sm text-slate-500">
          Compare token costs across models for the same workload. Select models and adjust token counts.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Token inputs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Token Counts</div>
          {[
            { label: 'Input tokens', val: inputTokens, set: setInputTokens },
            { label: 'Output tokens', val: outputTokens, set: setOutputTokens },
          ].map(({ label, val, set }) => (
            <label key={label} className="block">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <input
                type="number"
                min={0}
                value={val}
                onChange={(e) => set(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          ))}
          {/* Presets */}
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1">Presets</div>
          <div className="flex flex-wrap gap-1.5">
            {CALCULATOR_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setInputTokens(p.inputTokens); setOutputTokens(p.outputTokens); }}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model checkboxes */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Select Models</div>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {MODELS.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedIds.has(m.id)}
                  onChange={() => toggleModel(m.id)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{m.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  m.provider === 'Anthropic' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                }`}>{m.provider}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="text-sm font-semibold text-slate-700">Cost Comparison</div>
          <div className="text-xs text-slate-400">
            {inputTokens.toLocaleString()} input + {outputTokens.toLocaleString()} output tokens per request
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Model</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Input</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Output</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Total / req</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Per 1,000 req</th>
                <th className="px-5 py-3 text-slate-500 font-medium text-xs">Relative cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costs.sort((a, b) => a.total - b.total).map(({ model, inputCost, outputCost, total }) => {
                const widthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return (
                  <tr key={model.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{model.name}</div>
                      <div className="text-xs text-slate-400">{model.provider}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600 text-xs">{fmtCost(inputCost)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600 text-xs">{fmtCost(outputCost)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900">{fmtCost(total)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600">{fmtCost(total * 1000)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-10 text-right">{widthPct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
        <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
        Models sorted by total cost (lowest first). Relative cost bar compares within this selection only.
      </div>
    </div>
  );
};
