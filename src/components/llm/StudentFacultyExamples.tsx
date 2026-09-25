import React, { useState } from 'react';
import { USE_CASES } from '../../data/useCases';
import { MODELS, calcCost } from '../../data/models';
import { GraduationCap, Users, ChevronRight } from 'lucide-react';

const STUDENT_PROMPTS = [
  { label: 'Explain an accounting concept', taskId: 'student-explain-concept', example: '"Explain the difference between cash-basis and accrual accounting, and give me a realistic business example."' },
  { label: 'Understand a business case', taskId: 'student-business-case', example: '"Help me understand the key strategic issues in this HBS case on Netflix\'s content strategy."' },
  { label: 'Summarize course readings', taskId: 'student-summarize-article', example: '"Summarize the key arguments from chapters 3–5 of this strategy textbook."' },
  { label: 'Debug Python code', taskId: 'student-code', example: '"My Pandas code throws a KeyError — can you help me find the bug and explain why it happens?"' },
  { label: 'Study for an exam', taskId: 'student-study-exam', example: '"Quiz me on Porter\'s Five Forces — ask me questions and tell me when I\'m wrong."' },
  { label: 'Analyze a dataset', taskId: 'student-analyze-dataset', example: '"Write Python code to analyze this sales CSV and plot quarterly revenue trends."' },
];

const FACULTY_PROMPTS = [
  { label: 'Summarize 10 research papers', taskId: 'faculty-research-papers', example: '"Summarize the methodology and key findings of each of these 10 papers on platform economics."' },
  { label: 'Create discussion questions', taskId: 'faculty-case-studies', example: '"Generate 8 discussion questions for a case study on WeWork\'s failed IPO — suitable for MBA students."' },
  { label: 'Analyze this case', taskId: 'faculty-case-studies', example: '"Analyze the strategic choices made by Amazon in entering the healthcare market. Flag any gaps in the case narrative."' },
  { label: 'Create an assignment', taskId: 'faculty-lecture-materials', example: '"Design a realistic financial modeling assignment where students build a 3-statement model from a company\'s 10-K."' },
  { label: 'Review student writing', taskId: 'faculty-research-papers', example: '"Review this student memo for clarity, argument structure, and use of evidence. Provide specific feedback."' },
  { label: 'Develop lecture materials', taskId: 'faculty-lecture-materials', example: '"Create a 60-minute lecture outline on token economics for a graduate fintech course."' },
  { label: 'Analyze a large dataset', taskId: 'student-analyze-dataset', example: '"Write R code to run a panel regression on this dataset of firm-level data, and interpret the output."' },
  { label: 'Build a course assistant', taskId: 'faculty-ai-teaching-assistant', example: '"Design an AI assistant for my Managerial Accounting course — it should answer student questions based only on the course syllabus and readings."' },
];

function fmtCost(v: number): string {
  if (v < 0.001) return '<$0.001';
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(3)}`;
}

export const StudentFacultyExamples: React.FC = () => {
  const [tab, setTab] = useState<'student' | 'faculty'>('student');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const prompts = tab === 'student' ? STUDENT_PROMPTS : FACULTY_PROMPTS;
  const selectedPrompt = selectedIdx !== null ? prompts[selectedIdx] : null;
  const selectedTask = selectedPrompt ? USE_CASES.find((t) => t.id === selectedPrompt.taskId) : null;

  const displayModels = MODELS.filter((m) =>
    ['claude-haiku-4-5', 'claude-3-5-sonnet', 'claude-sonnet-5', 'gpt-4o-mini', 'gpt-4o'].includes(m.id)
  );

  const handleTabChange = (t: 'student' | 'faculty') => {
    setTab(t);
    setSelectedIdx(null);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Student & Faculty Examples</h2>
        <p className="text-sm text-slate-500">
          Click any example to see model recommendations and estimated costs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => handleTabChange('student')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            tab === 'student' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
          }`}
        >
          <GraduationCap size={16} />
          Student
        </button>
        <button
          onClick={() => handleTabChange('faculty')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            tab === 'faculty' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
          }`}
        >
          <Users size={16} />
          Faculty
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        {/* Prompt list */}
        <div className="md:col-span-2 space-y-1.5">
          {prompts.map((prompt, idx) => (
            <button
              key={prompt.label}
              onClick={() => setSelectedIdx(idx === selectedIdx ? null : idx)}
              className={`w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all ${
                selectedIdx === idx
                  ? tab === 'student'
                    ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                    : 'bg-violet-50 border-violet-200 text-violet-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{prompt.label}</span>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="md:col-span-3">
          {!selectedPrompt || !selectedTask ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm h-full flex flex-col items-center justify-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                tab === 'student' ? 'bg-blue-50' : 'bg-violet-50'
              }`}>
                {tab === 'student'
                  ? <GraduationCap size={22} className="text-blue-400" />
                  : <Users size={22} className="text-violet-400" />
                }
              </div>
              Select an example to see guidance and cost estimates
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Example Prompt</div>
                <div className="text-sm text-slate-700 italic leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {selectedPrompt.example}
                </div>
              </div>

              {/* Task info */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Why these models fit</div>
                {selectedTask.suggestedModelIds.slice(0, 3).map((modelId) => {
                  const model = MODELS.find((m) => m.id === modelId);
                  const note = selectedTask.modelNotes[modelId];
                  if (!model) return null;
                  return (
                    <div key={modelId} className="mb-3 last:mb-0 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                        }`}>{model.provider}</span>
                        <span className="text-sm font-semibold text-slate-800">{model.name}</span>
                      </div>
                      {note && <p className="text-xs text-slate-600 leading-relaxed">{note}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Cost estimate */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Cost</div>
                  <div className="text-xs text-slate-400">
                    ~{selectedTask.exampleTokens.input.toLocaleString()} in / ~{selectedTask.exampleTokens.output.toLocaleString()} out
                  </div>
                </div>
                <div className="space-y-1.5">
                  {displayModels.map((model) => {
                    const cost = calcCost(model, selectedTask.exampleTokens.input, selectedTask.exampleTokens.output);
                    return (
                      <div key={model.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-xs text-slate-700">{model.name}</span>
                        <span className="text-xs font-mono font-semibold text-slate-900">{fmtCost(cost.total)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-slate-400">Per single request. Token counts are approximate.</div>
              </div>

              {/* Considerations */}
              {selectedTask.considerations.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                  <div className="font-semibold mb-1.5">Things to consider</div>
                  {selectedTask.considerations.map((c) => (
                    <div key={c} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
