import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { CONTEXT_DEFAULT_ITEMS } from '../../data/examples';

function fmtTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function fmtCost(v: number): string {
  if (v < 0.0001) return '<$0.0001';
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

export const ContextVisualizer: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('claude-3-5-sonnet');
  const [items, setItems] = useState(CONTEXT_DEFAULT_ITEMS.map((i) => ({ ...i })));
  const [outputTokens, setOutputTokens] = useState(600);

  const model = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];

  const totalInput = useMemo(() => items.reduce((s, i) => s + i.tokens, 0), [items]);
  const pctUsed = totalInput / model.contextWindow;
  const cost = calcCost(model, totalInput, outputTokens);

  const updateItem = (idx: number, tokens: number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, tokens: Math.max(0, tokens) } : item));
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Context Window Visualizer</h2>
        <p className="text-sm text-slate-500">
          Every AI interaction fills a context window. See how different components contribute to total input tokens
          and understand the relationship between context size and cost.
        </p>
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
            <div className="mt-1.5 text-xs text-slate-400">Context window: {(model.contextWindow / 1000).toFixed(0)}K tokens</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Context Components</div>
            {items.map((item, idx) => (
              <label key={item.label} className="block">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-600">{item.label}</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={item.tokens}
                  onChange={(e) => updateItem(idx, parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ))}
            <label className="block">
              <div className="text-xs text-slate-600 mb-1">Expected output tokens</div>
              <input
                type="number"
                min={0}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3 space-y-4">
          {/* Visual context bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Context window usage</span>
              <span>{fmtTokens(totalInput)} / {fmtTokens(model.contextWindow)} tokens ({(pctUsed * 100).toFixed(1)}%)</span>
            </div>

            {/* Stacked bar */}
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden flex mb-3">
              {items.map((item) => {
                const w = totalInput > 0 ? (item.tokens / model.contextWindow) * 100 : 0;
                return w > 0 ? (
                  <div
                    key={item.label}
                    className="h-full transition-all"
                    style={{ width: `${Math.min(w, 100)}%`, background: item.color }}
                    title={`${item.label}: ${item.tokens.toLocaleString()} tokens`}
                  />
                ) : null;
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-mono text-slate-500">{item.tokens.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {pctUsed > 0.9 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                Context window nearly full. Responses may be truncated or the model may refuse the request.
              </div>
            )}
          </div>

          {/* Cost breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cost for This Interaction</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Input cost</div>
                <div className="text-lg font-bold text-slate-800">{fmtCost(cost.inputCost)}</div>
                <div className="text-xs text-slate-400">{totalInput.toLocaleString()} tokens</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Output cost</div>
                <div className="text-lg font-bold text-slate-800">{fmtCost(cost.outputCost)}</div>
                <div className="text-xs text-slate-400">{outputTokens.toLocaleString()} tokens</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <div className="text-xs text-blue-600 mb-1">Total</div>
                <div className="text-lg font-bold text-blue-800">{fmtCost(cost.total)}</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              <strong>Context window</strong> defines how much text a model can "see" at once —
              the limit on total input tokens. Larger context windows allow more documents, longer
              conversations, and richer instructions.
            </p>
            <p>
              <strong>Pricing is separate from context capacity.</strong> A model with a 200K context
              window doesn't cost more per token than one with a 128K window — each provider charges
              a flat rate per token regardless of how much of the window you use.
            </p>
            <p>
              <strong>Conversation history grows with each turn.</strong> Each user message adds to the
              context that gets sent back on the next call, so costs compound over multi-turn interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
