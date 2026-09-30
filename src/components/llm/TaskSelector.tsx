import React, { useState } from 'react';
import { USE_CASES } from '../../data/useCases';
import { MODELS, calcCost } from '../../data/models';
import type { TaskCategory } from '../../types/llm';
import { CheckCircle, ChevronRight, Info } from 'lucide-react';

const CATEGORIES: { id: TaskCategory; label: string; color: string }[] = [
  { id: 'student', label: 'Student', color: 'blue' },
  { id: 'faculty', label: 'Faculty', color: 'violet' },
  { id: 'research', label: 'Research', color: 'emerald' },
  { id: 'general', label: 'General', color: 'amber' },
];

const CAT_STYLE: Record<string, string> = {
  blue: 'bg-blue-600 text-white border-blue-600',
  violet: 'bg-violet-600 text-white border-violet-600',
  emerald: 'bg-emerald-600 text-white border-emerald-600',
  amber: 'bg-amber-600 text-white border-amber-600',
};

const CAT_INACTIVE: Record<string, string> = {
  blue: 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700',
  violet: 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700',
  emerald: 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700',
  amber: 'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700',
};

// Concrete example prompts for tasks that benefit from a illustrative, ready-to-use example.
const EXAMPLE_PROMPTS: Record<string, string[]> = {
  'student-explain-concept': [
    '"Explain the difference between cash-basis and accrual accounting, and give me a realistic business example."',
  ],
  'student-business-case': [
    '"Help me understand the key strategic issues in this HBS case on Netflix\'s content strategy."',
  ],
  'student-summarize-article': [
    '"Summarize the key arguments from chapters 3–5 of this strategy textbook."',
  ],
  'student-code': [
    '"My Pandas code throws a KeyError — can you help me find the bug and explain why it happens?"',
  ],
  'student-study-exam': [
    '"Quiz me on Porter\'s Five Forces — ask me questions and tell me when I\'m wrong."',
  ],
  'student-analyze-dataset': [
    '"Write Python code to analyze this sales CSV and plot quarterly revenue trends."',
    '"Write R code to run a panel regression on this dataset of firm-level data, and interpret the output."',
  ],
  'faculty-research-papers': [
    '"Summarize the methodology and key findings of each of these 10 papers on platform economics."',
    '"Review this student memo for clarity, argument structure, and use of evidence. Provide specific feedback."',
  ],
  'faculty-case-studies': [
    '"Generate 8 discussion questions for a case study on WeWork\'s failed IPO — suitable for MBA students."',
    '"Analyze the strategic choices made by Amazon in entering the healthcare market. Flag any gaps in the case narrative."',
  ],
  'faculty-lecture-materials': [
    '"Design a realistic financial modeling assignment where students build a 3-statement model from a company\'s 10-K."',
    '"Create a 60-minute lecture outline on token economics for a graduate fintech course."',
  ],
  'faculty-ai-teaching-assistant': [
    '"Design an AI assistant for my Managerial Accounting course — it should answer student questions based only on the course syllabus and readings."',
  ],
};

function fmtCost(v: number): string {
  if (v < 0.001) return '<$0.001';
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(3)}`;
}

export const TaskSelector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('student');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = USE_CASES.filter((t) => t.category === selectedCategory);
  const selectedTask = selectedTaskId ? USE_CASES.find((t) => t.id === selectedTaskId) : null;
  const examplePrompts = selectedTask ? EXAMPLE_PROMPTS[selectedTask.id] : undefined;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Which Model Should I Use?</h2>
        <p className="text-sm text-slate-500">
          Select what you're trying to accomplish to see example prompts, model recommendations, and
          estimated costs tailored to your task.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map(({ id, label, color }) => {
          const active = selectedCategory === id;
          return (
            <button
              key={id}
              onClick={() => { setSelectedCategory(id); setSelectedTaskId(null); }}
              className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                active ? CAT_STYLE[color] : `bg-white ${CAT_INACTIVE[color]}`
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        {/* Task list */}
        <div className="md:col-span-2 space-y-1">
          {tasks.map((task) => {
            const active = selectedTaskId === task.id;
            return (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                  active
                    ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{task.label}</span>
                {active ? <CheckCircle size={16} className="text-blue-500 flex-shrink-0" /> : <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Task detail */}
        <div className="md:col-span-3">
          {!selectedTask ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
              <Info size={24} className="mx-auto mb-2 text-slate-300" />
              Select a task from the list to see model recommendations
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1">{selectedTask.label}</h3>
                  <p className="text-sm text-slate-500">{selectedTask.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedTask.recommendedCapabilities.map((cap) => (
                      <span key={cap} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {examplePrompts && examplePrompts.length > 0 && (
                  <div className="p-5 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Example Prompts</div>
                    <div className="space-y-2">
                      {examplePrompts.map((ex) => (
                        <div key={ex} className="text-sm text-slate-700 italic leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3">
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suitable Models</div>
                  {selectedTask.suggestedModelIds.map((modelId) => {
                    const model = MODELS.find((m) => m.id === modelId);
                    const note = selectedTask.modelNotes[modelId];
                    if (!model) return null;
                    const cost = calcCost(model, selectedTask.exampleTokens.input, selectedTask.exampleTokens.output);
                    return (
                      <div key={modelId} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {model.provider}
                            </span>
                            <div className="font-semibold text-slate-900 text-sm mt-1">{model.name}</div>
                          </div>
                          <div className="text-right text-xs text-slate-500 flex-shrink-0">
                            <div className="font-mono font-semibold text-slate-800">{fmtCost(cost.total)}</div>
                            <div>est. per request</div>
                          </div>
                        </div>
                        {note && (
                          <div className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-lg p-3">
                            {note}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedTask.considerations.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-amber-800 mb-2">Things to consider</div>
                      <ul className="space-y-1.5">
                        {selectedTask.considerations.map((c) => (
                          <li key={c} className="text-xs text-amber-700 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 pt-1">
                    Example token usage: ~{selectedTask.exampleTokens.input.toLocaleString()} input / ~{selectedTask.exampleTokens.output.toLocaleString()} output per request
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
