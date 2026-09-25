import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { Zap, TrendingDown } from 'lucide-react';

function fmtCost(v: number): string {
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 1000) return `$${v.toFixed(2)}`;
  if (v < 1_000_000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export const CachingExplainer: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('claude-3-5-sonnet');
  const [materialTokens, setMaterialTokens] = useState(20000);
  const [queryTokens, setQueryTokens] = useState(300);
  const [outputTokens, setOutputTokens] = useState(800);
  const [totalRequests, setTotalRequests] = useState(100);
  const [cacheHitRate, setCacheHitRate] = useState(70);

  const model = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];
  const hasCaching = model.cachedInputPrice != null;

  const results = useMemo(() => {
    const hitRate = cacheHitRate / 100;
    const cacheReads = Math.round(totalRequests * hitRate);
    const cacheMisses = totalRequests - cacheReads;

    // Without caching: every request pays full input price for material
    const withoutCost = totalRequests * (
      calcCost(model, materialTokens + queryTokens, outputTokens).total
    );

    // With caching: cache hits use cached price for material
    const cachedPrice = model.cachedInputPrice ?? model.inputPrice;
    const hitCost = cacheReads * (
      (materialTokens / 1_000_000) * cachedPrice +
      (queryTokens / 1_000_000) * model.inputPrice +
      (outputTokens / 1_000_000) * model.outputPrice
    );
    const missCost = cacheMisses * (
      calcCost(model, materialTokens + queryTokens, outputTokens).total
    );
    const withCost = hitCost + missCost;

    const savings = withoutCost - withCost;
    const savingsPct = withoutCost > 0 ? (savings / withoutCost) * 100 : 0;

    return { withoutCost, withCost, savings, savingsPct, cacheReads, cacheMisses };
  }, [model, materialTokens, queryTokens, outputTokens, totalRequests, cacheHitRate]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Prompt Caching</h2>
        <p className="text-sm text-slate-500">
          Providers offer reduced pricing for repeated input tokens (cached reads).
          This is especially valuable when the same large context is referenced across many requests.
        </p>
      </div>

      {/* Concept explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Example Scenario: Course Document + Student Queries</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Course material', desc: "A professor's 20,000-token course document loaded into every student interaction", color: '#0ea5e9' },
            { label: 'Student queries', desc: 'Each student asks a short question (300 tokens)', color: '#f59e0b' },
            { label: 'AI responses', desc: 'The model responds based on the course material (800 tokens)', color: '#10b981' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="w-3 h-3 rounded-sm mb-2" style={{ background: item.color }} />
              <div className="text-xs font-semibold text-slate-700 mb-1">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
          Without caching, the full course material is billed at the input price for every student request.
          With caching, repeated reads of the same material are billed at the (lower) cached read price.
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
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
            {!hasCaching && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                This model doesn't list cached pricing — using input price for all tokens.
              </div>
            )}
            {hasCaching && (
              <div className="mt-2 text-xs text-slate-400">
                Input: ${model.inputPrice}/1M · Cached: ${model.cachedInputPrice}/1M
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Scenario Parameters</div>
            {[
              { label: 'Shared material tokens', val: materialTokens, set: setMaterialTokens },
              { label: 'Per-request query tokens', val: queryTokens, set: setQueryTokens },
              { label: 'Output tokens per request', val: outputTokens, set: setOutputTokens },
              { label: 'Total requests', val: totalRequests, set: setTotalRequests },
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
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Cache hit rate</span>
                <span>{cacheHitRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={cacheHitRate}
                onChange={(e) => setCacheHitRate(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0% (no cache)</span>
                <span>100% (full cache)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cost Comparison</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Without caching</div>
                <div className="text-2xl font-bold text-slate-900">{fmtCost(results.withoutCost)}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {totalRequests} × full input price
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-xs text-emerald-600 mb-1">With caching</div>
                <div className="text-2xl font-bold text-emerald-800">{fmtCost(results.withCost)}</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {results.cacheReads} cache hits + {results.cacheMisses} full reads
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Estimated savings</span>
              </div>
              <div className="text-3xl font-bold text-emerald-800">{fmtCost(results.savings)}</div>
              <div className="text-sm text-emerald-600 mt-0.5">{results.savingsPct.toFixed(1)}% cost reduction</div>
            </div>
          </div>

          {/* Savings bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-600 mb-3">Cost breakdown</div>
            <div className="space-y-2">
              {[
                { label: 'Without caching', value: results.withoutCost, max: results.withoutCost, color: 'bg-red-300' },
                { label: 'With caching', value: results.withCost, max: results.withoutCost, color: 'bg-emerald-400' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{label}</span>
                    <span className="font-mono">{fmtCost(value)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            <strong>How prompt caching works:</strong> When the same prefix of your prompt (e.g. a long system prompt or document)
            is identical across requests, providers can store it and serve future reads at a reduced rate.
            Caching is particularly valuable for teaching assistants, document Q&A systems, and any workflow
            where a large shared context is referenced repeatedly.
          </div>
        </div>
      </div>
    </div>
  );
};
