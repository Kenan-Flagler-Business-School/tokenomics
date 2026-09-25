import React from 'react';
import { BookOpen, Calculator, ChevronRight, BarChart2, Users, GraduationCap } from 'lucide-react';

interface Props {
  onSelect: (app: 'tokenomics' | 'llm') => void;
}

export const HomePage: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center" style={{ background: '#1e3a5f' }}>
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-slate-800">AI Economics Lab</span>
            <span className="ml-2 text-xs text-slate-400 font-medium uppercase tracking-wider">Kenan-Flagler Business School</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center mb-12">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-3">Interactive Learning Tools</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI Economics & LLM Reference
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Two interactive applications for understanding the business economics of AI —
            from token pricing to platform strategy.
          </p>
        </div>

        {/* App Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* LLM Guide */}
          <button
            onClick={() => onSelect('llm')}
            className="group text-left bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <Calculator size={22} className="text-blue-600" />
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">LLM Guide & Cost Calculator</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Explore current AI models, understand which model fits your task, and calculate
              real API token costs for students, faculty, and research workflows.
            </p>
            <div className="space-y-2">
              {[
                'Compare OpenAI & Anthropic models',
                'Task-based model recommendations',
                'Interactive token cost calculator',
                'Monthly usage & agent cost modeling',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Students', 'Faculty', 'Research', 'Pricing'].map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Tokenomics Case Study */}
          <button
            onClick={() => onSelect('tokenomics')}
            className="group text-left bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-emerald-400 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <BookOpen size={22} className="text-emerald-600" />
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors mt-1" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">AI Token Economics — Case Study</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              An interactive MBA-style case study on Axiom AI's token economics platform.
              Explore platform economics, token design, valuation models, and scenario analysis.
            </p>
            <div className="space-y-2">
              {[
                'Token design & vesting schedules',
                'Fisher\'s MV=PQ valuation model',
                'Scenario & sensitivity analysis',
                'Treasury modeling & stress testing',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['MBA', 'Strategy', 'Tokenomics', 'Simulation'].map((tag) => (
                <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Audience Tags */}
        <div className="mt-10 flex flex-wrap gap-6 items-center justify-center text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} />
            <span>Students</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>Faculty</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            <span>Research</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <span>Kenan-Flagler Business School</span>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        Educational use only. Not financial advice.
      </footer>
    </div>
  );
};
