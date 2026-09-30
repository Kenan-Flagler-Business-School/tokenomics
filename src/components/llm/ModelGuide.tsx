import React from 'react';
import { MODELS } from '../../data/models';

export const ModelGuide: React.FC = () => {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Model Guide</h2>
        <p className="text-sm text-slate-500">
          Current models from Anthropic and OpenAI, grouped by what they're best at. See the
          Model Details section below for full pricing and capability breakdowns on every model.
        </p>
      </div>

      {/* Category groups */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Model Categories</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Complex Reasoning', desc: 'Difficult analysis, multi-step problems, research', examples: ['claude-fable-5-1', 'claude-opus-5-5', 'gpt-6-astra', 'o3', 'o3-pro'] },
            { label: 'Fast & Efficient', desc: 'Summarization, classification, simple Q&A, drafting', examples: ['claude-haiku-4-5', 'gpt-6-luna', 'gpt-5-nano', 'gpt-4-1-nano'] },
            { label: 'Coding', desc: 'Code generation, debugging, refactoring, agents', examples: ['claude-sonnet-5', 'o4-mini', 'o3-mini', 'gpt-4-1'] },
            { label: 'Long Documents', desc: 'Research papers, case studies, large documents (1M+ context)', examples: ['gpt-4-1', 'gpt-4-1-mini', 'claude-fable-5-1', 'claude-sonnet-5'] },
          ].map((cat) => {
            const examples = cat.examples.filter((id) => MODELS.some((m) => m.id === id));
            if (examples.length === 0) return null;
            return (
              <div key={cat.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 text-sm mb-1">{cat.label}</h4>
                <p className="text-xs text-slate-500 mb-3">{cat.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {examples.map((id) => {
                    const m = MODELS.find((x) => x.id === id);
                    return m ? (
                      <span key={id} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-600">{m.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
