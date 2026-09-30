import React, { useEffect, useState } from 'react';
import { TASK_EXAMPLES } from '../../data/examples';
import { MODELS, calcCost } from '../../data/models';
import type { TaskCategory, TaskExample } from '../../types/llm';
import { X } from 'lucide-react';

const CAT_LABEL: Record<TaskCategory, string> = {
  student: 'Student',
  faculty: 'Faculty',
  research: 'Research',
  general: 'General',
};

const CAT_COLOR: Record<TaskCategory, string> = {
  student: 'bg-blue-50 text-blue-700',
  faculty: 'bg-violet-50 text-violet-700',
  research: 'bg-emerald-50 text-emerald-700',
  general: 'bg-amber-50 text-amber-700',
};

function fmtCost(v: number): string {
  if (v < 0.001) return '<$0.001';
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(3)}`;
}

const displayModels = MODELS.filter((m) =>
  ['claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-5-5', 'gpt-6-luna', 'gpt-6-sol', 'gpt-6-astra'].includes(m.id)
);

interface TaskExampleTileProps {
  example: TaskExample;
  onOpen: (example: TaskExample) => void;
}

const TaskExampleTile: React.FC<TaskExampleTileProps> = ({ example, onOpen }) => (
  <button
    onClick={() => onOpen(example)}
    className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
  >
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[example.category]}`}>
      {CAT_LABEL[example.category]}
    </span>
    <div className="font-semibold text-slate-900 text-sm mt-1.5">{example.title}</div>
    <div className="text-xs text-slate-500 mt-0.5">{example.description}</div>
    <div className="flex gap-3 mt-2.5 text-xs text-slate-500">
      <span>{example.inputTokens.toLocaleString()} in</span>
      <span>{example.outputTokens.toLocaleString()} out</span>
    </div>
  </button>
);

interface TaskExampleModalProps {
  example: TaskExample;
  tokens: { input: number; output: number };
  onChangeTokens: (tokens: { input: number; output: number }) => void;
  onClose: () => void;
}

const TaskExampleModal: React.FC<TaskExampleModalProps> = ({ example, tokens, onChangeTokens, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[example.category]}`}>
              {CAT_LABEL[example.category]}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1.5">{example.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{example.description}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Recommended Characteristics</div>
            <div className="flex flex-wrap gap-1.5">
              {example.recommendedCharacteristics.map((c) => (
                <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1">{c}</span>
              ))}
            </div>
          </div>

          {/* Token editor */}
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Adjust Token Counts</div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Input tokens</span>
                <input
                  type="number"
                  value={tokens.input}
                  onChange={(e) => onChangeTokens({ ...tokens, input: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-36 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Output tokens</span>
                <input
                  type="number"
                  value={tokens.output}
                  onChange={(e) => onChangeTokens({ ...tokens, output: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-36 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          </div>

          {/* Cost table */}
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Cost Per Request</div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Model</th>
                    <th className="text-right px-4 py-2 text-slate-500 font-medium">Provider</th>
                    <th className="text-right px-4 py-2 text-slate-500 font-medium">Total</th>
                    <th className="text-right px-4 py-2 text-slate-500 font-medium">Per 1,000</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayModels.map((model) => {
                    const cost = calcCost(model, tokens.input, tokens.output);
                    return (
                      <tr key={model.id} className="hover:bg-slate-100">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{model.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {model.provider}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900">{fmtCost(cost.total)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-600">{fmtCost(cost.total * 1000)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
            <strong>Note:</strong> {example.notes}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaskExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState<TaskExample | null>(null);
  const [tokenEdits, setTokenEdits] = useState<Record<string, { input: number; output: number }>>({});

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Task Examples</h2>
        <p className="text-sm text-slate-500">
          Practical examples with estimated token usage. Click any example to see costs across models.
          You can adjust token counts to reflect your actual usage.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TASK_EXAMPLES.map((example) => (
          <TaskExampleTile key={example.id} example={example} onOpen={setActiveExample} />
        ))}
      </div>

      {activeExample && (
        <TaskExampleModal
          example={activeExample}
          tokens={tokenEdits[activeExample.id] ?? { input: activeExample.inputTokens, output: activeExample.outputTokens }}
          onChangeTokens={(tokens) => setTokenEdits((prev) => ({ ...prev, [activeExample.id]: tokens }))}
          onClose={() => setActiveExample(null)}
        />
      )}
    </div>
  );
};
