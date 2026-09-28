import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { CALCULATOR_PRESETS } from '../../data/examples';
import { AlertCircle } from 'lucide-react';

function fmtCost(v: number, decimals = 6): string {
  if (v === 0) return '$0.000000';
  if (v < 0.000001) return '<$0.000001';
  return `$${v.toFixed(decimals)}`;
}

function fmtCostShort(v: number): string {
  if (v === 0) return '$0.00';
  if (v < 0.001) return `$${v.toFixed(6)}`;
  if (v < 1) return `$${v.toFixed(4)}`;
  if (v < 1000) return `$${v.toFixed(2)}`;
  if (v < 1_000_000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export const TokenCalculator: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('claude-sonnet-5');
  const [inputTokens, setInputTokens] = useState(3000);
  const [outputTokens, setOutputTokens] = useState(1000);
  const [cachedTokens, setCachedTokens] = useState(0);

  const model = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];

  const cost = useMemo(
    () => calcCost(model, inputTokens, outputTokens, cachedTokens),
    [model, inputTokens, outputTokens, cachedTokens]
  );

  const scales = [1, 100, 1000, 10000, 100000];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Token Cost Calculator</h2>
        <p className="text-sm text-slate-500">
          Enter your token counts to calculate the exact API cost for any model.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Input panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Model selector */}
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
            <div className="mt-2 text-xs text-slate-400">
              {model.provider} · {model.family} · Context: {(model.contextWindow / 1000).toFixed(0)}K tokens
            </div>
          </div>

          {/* Token inputs */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Token Counts</div>
            {[
              { label: 'Input tokens', val: inputTokens, set: setInputTokens, price: model.inputPrice },
              { label: 'Output tokens', val: outputTokens, set: setOutputTokens, price: model.outputPrice },
              { label: 'Cached input tokens (optional)', val: cachedTokens, set: setCachedTokens, price: model.cachedInputPrice ?? 0 },
            ].map(({ label, val, set, price }) => (
              <label key={label} className="block">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-slate-400">${price.toFixed(2)}/1M</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => set(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ))}
          </div>

          {/* Presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Quick Presets</div>
            <div className="space-y-1.5">
              {CALCULATOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setInputTokens(preset.inputTokens);
                    setOutputTokens(preset.outputTokens);
                    setCachedTokens(preset.cachedTokens);
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-800">{preset.label}</div>
                    <div className="text-xs text-slate-400">{preset.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 text-right flex-shrink-0">
                    <div>{preset.inputTokens.toLocaleString()} in</div>
                    <div>{preset.outputTokens.toLocaleString()} out</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Cost of this request */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cost of This Request</div>

            <div className="text-4xl font-bold text-slate-900 mb-1">{fmtCostShort(cost.total)}</div>
            <div className="text-sm text-slate-500 mb-5">with {model.name}</div>

            <div className="space-y-2">
              {[
                { label: 'Input cost', value: cost.inputCost, sub: `${inputTokens.toLocaleString()} tokens × $${model.inputPrice}/1M` },
                { label: 'Output cost', value: cost.outputCost, sub: `${outputTokens.toLocaleString()} tokens × $${model.outputPrice}/1M` },
                ...(cachedTokens > 0 && model.cachedInputPrice != null
                  ? [{ label: 'Cached input cost', value: cost.cachedCost, sub: `${cachedTokens.toLocaleString()} tokens × $${model.cachedInputPrice}/1M` }]
                  : []),
              ].map(({ label, value, sub }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-sm text-slate-700">{label}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                  <div className="font-mono text-sm font-medium text-slate-800">{fmtCost(value, 6)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scale table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cost at Scale</div>
            <div className="space-y-2">
              {scales.map((n) => {
                const total = cost.total * n;
                return (
                  <div key={n} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="text-sm text-slate-700">{n === 1 ? '1 request' : `${n.toLocaleString()} requests`}</div>
                    <div className="font-mono text-sm font-semibold text-slate-900">{fmtCostShort(total)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing note */}
          {!model.pricingVerified && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Note:</strong> Pricing for {model.name} is estimated. Verify the current rate at{' '}
                <a href={model.pricingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {model.provider === 'Anthropic' ? 'claude.com/pricing' : 'developers.openai.com/api/docs/pricing'}
                </a>{' '}
                before making decisions.
              </div>
            </div>
          )}

          {/* Context gauge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Context usage</span>
              <span>{((inputTokens + cachedTokens) / model.contextWindow * 100).toFixed(1)}% of {(model.contextWindow / 1000).toFixed(0)}K window</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (inputTokens + cachedTokens) / model.contextWindow > 0.9 ? 'bg-red-400' :
                  (inputTokens + cachedTokens) / model.contextWindow > 0.7 ? 'bg-amber-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(100, (inputTokens + cachedTokens) / model.contextWindow * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">Input + cached tokens vs. context window limit</div>
          </div>
        </div>
      </div>
    </div>
  );
};
