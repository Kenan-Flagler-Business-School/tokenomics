import React, { useState, useMemo } from 'react';
import { MODELS, calcCost } from '../../data/models';
import { Cpu, ArrowRight } from 'lucide-react';

function fmtCost(v: number): string {
  if (v < 0.001) return `$${v.toFixed(6)}`;
  if (v < 100) return `$${v.toFixed(4)}`;
  if (v < 100_000) return `$${v.toFixed(2)}`;
  return `$${(v / 1000).toFixed(1)}K`;
}

const EXAMPLE_FLOW = [
  { step: 1, label: 'Planning call', description: 'Agent plans how to approach the task' },
  { step: 2, label: 'Document retrieval', description: 'Agent retrieves relevant context or documents' },
  { step: 3, label: 'Analysis call', description: 'Agent analyzes retrieved content' },
  { step: 4, label: 'Follow-up reasoning', description: 'Agent refines or validates findings' },
  { step: 5, label: 'Final response', description: 'Agent synthesizes and delivers the answer' },
];

export const AgentCalculator: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('claude-3-5-sonnet');
  const [callsPerTask, setCallsPerTask] = useState(5);
  const [inputPerCall, setInputPerCall] = useState(4000);
  const [outputPerCall, setOutputPerCall] = useState(1500);

  const model = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];

  const { perCall, perTask } = useMemo(() => {
    const perCall = calcCost(model, inputPerCall, outputPerCall).total;
    const perTask = perCall * callsPerTask;
    return { perCall, perTask };
  }, [model, inputPerCall, outputPerCall, callsPerTask]);

  const taskScales = [10, 100, 1000, 10000];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">AI Agent Cost Calculator</h2>
        <p className="text-sm text-slate-500">
          An AI agent may make multiple LLM calls for a single user request. This section helps you
          understand the actual token cost of agentic workflows.
        </p>
      </div>

      {/* Explainer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="font-semibold text-slate-800 mb-2 text-sm">Example: "Research and analyze this business case"</h3>
        <p className="text-xs text-slate-500 mb-4">
          A student makes one request, but the AI agent may execute multiple LLM calls to complete it:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {EXAMPLE_FLOW.map((step, i) => (
            <React.Fragment key={step.step}>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-slate-400 mb-0.5">Call {step.step}</div>
                <div className="text-xs font-medium text-slate-700">{step.label}</div>
              </div>
              {i < EXAMPLE_FLOW.length - 1 && <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
          Each arrow represents a separate API call — tokens are consumed at each step.
          A single user request can cost 5–15× more tokens than a simple chat exchange.
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
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Agent Parameters</div>
            {[
              { label: 'LLM calls per task', val: callsPerTask, set: setCallsPerTask, min: 1 },
              { label: 'Input tokens per call', val: inputPerCall, set: setInputPerCall, min: 0 },
              { label: 'Output tokens per call', val: outputPerCall, set: setOutputPerCall, min: 0 },
            ].map(({ label, val, set, min }) => (
              <label key={label} className="block">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <input
                  type="number"
                  min={min}
                  value={val}
                  onChange={(e) => set(Math.max(min, parseInt(e.target.value) || min))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ))}
          </div>

          {/* Presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Agent Complexity</div>
            <div className="space-y-1.5">
              {[
                { label: 'Simple agent', calls: 2, input: 2000, output: 800 },
                { label: 'Standard agent', calls: 5, input: 4000, output: 1500 },
                { label: 'Complex agent', calls: 10, input: 8000, output: 3000 },
                { label: 'Research agent', calls: 15, input: 15000, output: 4000 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setCallsPerTask(p.calls); setInputPerCall(p.input); setOutputPerCall(p.output); }}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm transition-colors"
                >
                  <span className="font-medium text-slate-700">{p.label}</span>
                  <span className="text-xs text-slate-400">{p.calls} calls</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cost Per Agent Task</div>

            <div className="flex items-start gap-4 mb-5">
              <div>
                <div className="text-3xl font-bold text-slate-900">{fmtCost(perTask)}</div>
                <div className="text-sm text-slate-500 mt-0.5">per agent task ({callsPerTask} calls × {fmtCost(perCall)}/call)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {taskScales.map((n) => (
                <div key={n} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">{n.toLocaleString()} tasks</div>
                  <div className="text-lg font-bold text-slate-900">{fmtCost(perTask * n)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total tokens */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Token Usage Per Task</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Input tokens', value: inputPerCall * callsPerTask },
                { label: 'Output tokens', value: outputPerCall * callsPerTask },
                { label: 'Total tokens', value: (inputPerCall + outputPerCall) * callsPerTask },
                { label: 'vs. single call', value: null },
              ].map(({ label, value }, i) => (
                <div key={label} className={`bg-slate-50 border border-slate-200 rounded-xl p-3 ${i === 3 ? 'col-span-2' : ''}`}>
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  {value !== null ? (
                    <div className="text-lg font-bold text-slate-800">{value.toLocaleString()}</div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      This task uses <strong>{callsPerTask}×</strong> more tokens than a single {inputPerCall.toLocaleString()}-token input call.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            <strong>Key insight:</strong> Agent architectures multiply token costs. A 5-call agent task costs
            5× more than a single interaction. At scale, the number of agent calls per user task becomes
            one of the most important cost levers to optimize.
          </div>
        </div>
      </div>
    </div>
  );
};
