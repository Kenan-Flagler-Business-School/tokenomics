import React, { useState } from 'react';
import { USE_CASES } from '../../data/useCases';
import { MODELS } from '../../data/models';
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

export const TaskSelector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('student');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = USE_CASES.filter((t) => t.category === selectedCategory);
  const selectedTask = selectedTaskId ? USE_CASES.find((t) => t.id === selectedTaskId) : null;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Which Model Should I Use?</h2>
        <p className="text-sm text-slate-500">
          Select what you're trying to accomplish to see model recommendations tailored to your task.
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

              <div className="p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suitable Models</div>
                {selectedTask.suggestedModelIds.map((modelId) => {
                  const model = MODELS.find((m) => m.id === modelId);
                  const note = selectedTask.modelNotes[modelId];
                  if (!model) return null;
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
                          <div className="font-medium text-slate-700">${model.inputPrice.toFixed(2)} / ${model.outputPrice.toFixed(2)}</div>
                          <div>per 1M in/out</div>
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
          )}
        </div>
      </div>
    </div>
  );
};
