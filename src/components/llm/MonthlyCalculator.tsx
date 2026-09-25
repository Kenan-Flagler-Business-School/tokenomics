import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { MONTHLY_PRESETS } from '../../data/examples';

function fmtCost(v: number): string {
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 100) return `$${v.toFixed(2)}`;
  if (v < 100_000) return `$${v.toFixed(0)}`;
  if (v < 1_000_000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export const MonthlyCalculator: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('claude-3-5-sonnet');
  const [requestsPerDay, setRequestsPerDay] = useState(10);
  const [inputTokens, setInputTokens] = useState(3000);
  const [outputTokens, setOutputTokens] = useState(1000);
  const [daysPerMonth, setDaysPerMonth] = useState(22);

  const model = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];

  const { perRequest, daily, weekly, monthly, annual } = useMemo(() => {
    const perRequest = calcCost(model, inputTokens, outputTokens).total;
    const daily = perRequest * requestsPerDay;
    const weekly = daily * 7;
    const monthly = perRequest * requestsPerDay * daysPerMonth;
    const annual = monthly * 12;
    return { perRequest, daily, weekly, monthly, annual };
  }, [model, inputTokens, outputTokens, requestsPerDay, daysPerMonth]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Monthly Usage Calculator</h2>
        <p className="text-sm text-slate-500">
          Estimate what a recurring AI workflow would cost over time.
          These are illustrative projections based on consistent usage patterns.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Model */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <optgroup label="Anthropic">
                {MODELS.filter((m) => m.provider === 'Anthropic').map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="OpenAI">
                {MODELS.filter((m) => m.provider === 'OpenAI').map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Usage inputs */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Usage Pattern</div>
            {[
              { label: 'Requests per day', val: requestsPerDay, set: setRequestsPerDay, min: 1 },
              { label: 'Input tokens per request', val: inputTokens, set: setInputTokens, min: 0 },
              { label: 'Output tokens per request', val: outputTokens, set: setOutputTokens, min: 0 },
              { label: 'Active days per month', val: daysPerMonth, set: setDaysPerMonth, min: 1, max: 31 },
            ].map(({ label, val, set, min, max }) => (
              <label key={label} className="block">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={val}
                  onChange={(e) => set(Math.max(min ?? 0, parseInt(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ))}
          </div>

          {/* Presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Usage Presets</div>
            <div className="text-xs text-slate-400 mb-2">Illustrative examples — actual usage varies</div>
            <div className="space-y-1.5">
              {MONTHLY_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setRequestsPerDay(p.requestsPerDay);
                    setInputTokens(p.inputTokens);
                    setOutputTokens(p.outputTokens);
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm transition-colors"
                >
                  <span className="font-medium text-slate-700">{p.label}</span>
                  <span className="text-xs text-slate-400">{p.requestsPerDay} req/day</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Projected Costs</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Per request', value: perRequest, sub: `${inputTokens.toLocaleString()} in + ${outputTokens.toLocaleString()} out` },
                { label: 'Daily', value: daily, sub: `${requestsPerDay} requests/day` },
                { label: 'Weekly', value: weekly, sub: '7 days' },
                { label: 'Monthly', value: monthly, sub: `${daysPerMonth} active days` },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-xl font-bold text-slate-900">{fmtCost(value)}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-xs text-blue-600 mb-1">Annual projection</div>
              <div className="text-3xl font-bold text-blue-800">{fmtCost(annual)}</div>
              <div className="text-xs text-blue-500 mt-1">{(requestsPerDay * daysPerMonth * 12).toLocaleString()} requests/year</div>
            </div>
          </div>

          {/* Comparison across models */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Monthly Cost — All Models</div>
            <div className="space-y-2">
              {MODELS.map((m) => {
                const mc = calcCost(m, inputTokens, outputTokens).total * requestsPerDay * daysPerMonth;
                return (
                  <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="text-sm text-slate-800 font-medium">{m.name}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                        m.provider === 'Anthropic' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                      }`}>{m.provider}</span>
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-900">{fmtCost(mc)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong>Illustrative projections only.</strong> Actual costs depend on real usage patterns,
            which vary by task type, session length, and user behavior. Use these estimates for planning
            purposes and validate against actual API usage data.
          </div>
        </div>
      </div>
    </div>
  );
};
