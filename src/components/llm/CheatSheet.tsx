import React, { useState } from 'react';
import { MODELS } from '../../data/models';

const CHEAT_ROWS = [
  {
    task: 'Simple Q&A',
    lookFor: 'Fast, cost-efficient model',
    capabilityFilter: (m: typeof MODELS[0]) => m.reasoning === 'standard',
  },
  {
    task: 'Summarization',
    lookFor: 'Efficient model',
    capabilityFilter: (m: typeof MODELS[0]) => m.reasoning !== 'exceptional',
  },
  {
    task: 'Complex reasoning',
    lookFor: 'Strong / exceptional reasoning model',
    capabilityFilter: (m: typeof MODELS[0]) => m.reasoning === 'strong' || m.reasoning === 'exceptional',
  },
  {
    task: 'Coding / debugging',
    lookFor: 'Strong coding model',
    capabilityFilter: (m: typeof MODELS[0]) => m.coding === 'strong' || m.coding === 'exceptional',
  },
  {
    task: 'Long documents',
    lookFor: 'Large context window (200K+)',
    capabilityFilter: (m: typeof MODELS[0]) => m.contextWindow >= 200_000,
  },
  {
    task: 'Research synthesis',
    lookFor: 'Reasoning + large context',
    capabilityFilter: (m: typeof MODELS[0]) => m.contextWindow >= 128_000 && (m.reasoning === 'strong' || m.reasoning === 'exceptional'),
  },
  {
    task: 'High-volume tasks',
    lookFor: 'Low-cost model',
    capabilityFilter: (m: typeof MODELS[0]) => m.inputPrice <= 1.00,
  },
  {
    task: 'AI agents',
    lookFor: 'Reasoning + tool use',
    capabilityFilter: (m: typeof MODELS[0]) => m.toolUse && (m.agentSuitable === 'strong' || m.agentSuitable === 'best'),
  },
  {
    task: 'Image / chart analysis',
    lookFor: 'Vision / multimodal capability',
    capabilityFilter: (m: typeof MODELS[0]) => m.vision,
  },
  {
    task: 'Data analysis / coding',
    lookFor: 'Strong coding + quantitative reasoning',
    capabilityFilter: (m: typeof MODELS[0]) => m.coding === 'strong' || m.coding === 'exceptional',
  },
];

export const CheatSheet: React.FC = () => {
  const [activeRow, setActiveRow] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">LLM Quick Reference</h2>
        <p className="text-sm text-slate-500">
          A quick guide to matching tasks with model characteristics.
          Click any row to see which models have those capabilities.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wider">Task</th>
              <th className="text-left px-5 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wider">Look for</th>
              <th className="text-left px-5 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Matching models</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CHEAT_ROWS.map((row, idx) => {
              const matches = MODELS.filter(row.capabilityFilter);
              const isActive = activeRow === idx;
              return (
                <React.Fragment key={row.task}>
                  <tr
                    className={`cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() => setActiveRow(isActive ? null : idx)}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.task}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.lookFor}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {matches.slice(0, 3).map((m) => (
                          <span key={m.id} className={`text-xs px-2 py-0.5 rounded-full ${
                            m.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {m.name}
                          </span>
                        ))}
                        {matches.length > 3 && (
                          <span className="text-xs text-slate-400">+{matches.length - 3} more</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isActive && (
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="px-5 pb-4 pt-1">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {matches.map((model) => (
                            <div key={model.id} className="bg-white border border-blue-100 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-semibold text-slate-800">{model.name}</div>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                                }`}>{model.provider}</span>
                              </div>
                              <div className="text-xs text-slate-500 mb-1">{model.description.slice(0, 80)}…</div>
                              <div className="text-xs font-mono text-slate-400">${model.inputPrice}/${model.outputPrice} per 1M in/out</div>
                            </div>
                          ))}
                          {matches.length === 0 && (
                            <div className="text-xs text-slate-400 col-span-3 py-2">No models match this exact filter.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Core concepts */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Key Concepts</h3>
          <div className="space-y-2 text-xs text-slate-600">
            {[
              ['Token', 'A unit of text — roughly 4 characters or ¾ of a word in English.'],
              ['Context window', 'Maximum total tokens the model can process at once (input + output).'],
              ['Input / output pricing', 'Separate rates per 1M tokens. Output tokens typically cost more.'],
              ['Cached input', 'Repeated prompt prefixes may be read at a lower price if the provider supports it.'],
              ['Reasoning model', 'Thinks through problems step-by-step internally before responding. Slower, more capable.'],
            ].map(([term, def]) => (
              <div key={term}>
                <strong className="text-slate-700">{term}:</strong> {def}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Rough Token Guide</h3>
          <div className="space-y-2 text-xs text-slate-600">
            {[
              ['1 word', '~1.3 tokens'],
              ['1 sentence', '~15–25 tokens'],
              ['1 paragraph', '~75–125 tokens'],
              ['1 page (250 words)', '~350 tokens'],
              ['10 pages', '~3,500 tokens'],
              ['Research paper (30 pages)', '~10,000–15,000 tokens'],
              ['Harvard case study (30 pages + exhibits)', '~20,000–30,000 tokens'],
              ['100-page report', '~70,000–90,000 tokens'],
              ['Typical image', '~1,000–4,000 tokens'],
            ].map(([item, tokens]) => (
              <div key={item} className="flex justify-between border-b border-slate-100 pb-1 last:border-0">
                <span>{item}</span>
                <span className="font-mono text-slate-500">{tokens}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
