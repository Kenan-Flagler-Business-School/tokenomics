import React, { useState } from 'react';
import { BookOpen, Calculator, Grid, List, BarChart2, BookMarked, Cpu, Calendar, Zap, Eye, Shield, HelpCircle, ArrowLeft, Menu, X, Info } from 'lucide-react';
import { ModelGuide } from './ModelGuide';
import { ModelDetails } from './ModelDetails';
import { TaskSelector } from './TaskSelector';
import { TaskExamples } from './TaskExamples';
import { TokenCalculator } from './TokenCalculator';
import { ModelComparison } from './ModelComparison';
import { MonthlyCalculator } from './MonthlyCalculator';
import { AgentCalculator } from './AgentCalculator';
import { ContextVisualizer } from './ContextVisualizer';
import { CachingExplainer } from './CachingExplainer';
import { CheatSheet } from './CheatSheet';
import { DataSources } from './DataSources';

interface Props {
  onBack: () => void;
}

const NAV_ITEMS = [
  { id: 'model-guide', label: 'Model Guide', icon: Grid },
  { id: 'task-selector', label: 'Which Model?', icon: HelpCircle },
  { id: 'task-examples', label: 'Task Examples', icon: BookMarked },
  { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
  { id: 'compare', label: 'Compare Models', icon: BarChart2 },
  { id: 'monthly', label: 'Monthly Usage', icon: Calendar },
  { id: 'agents', label: 'AI Agents', icon: Cpu },
  { id: 'context', label: 'Context Window', icon: Eye },
  { id: 'caching', label: 'Caching', icon: Zap },
  { id: 'cheat-sheet', label: 'Quick Reference', icon: List },
  { id: 'model-details', label: 'Model Details', icon: Info },
  { id: 'sources', label: 'Data Sources', icon: Shield },
];

export const LLMApp: React.FC<Props> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('model-guide');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mr-1"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Home</span>
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">LLM Guide & Cost Calculator</span>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 pt-14 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} />
          <nav className="relative bg-white w-72 h-full overflow-y-auto border-r border-slate-200 p-4">
            <div className="space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={16} className={activeSection === id ? 'text-blue-500' : 'text-slate-400'} />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-slate-200 overflow-y-auto z-20">
          <nav className="p-3 space-y-0.5">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sections</div>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={15} className={activeSection === id ? 'text-blue-500' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-56 px-4 sm:px-8 py-8 max-w-5xl">
          {/* Intro */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">LLM Guide & Cost Calculator</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              A practical reference for students, faculty, and researchers. Explore available AI models,
              find the right model for your task, and calculate real API costs before you build or use.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <Shield size={13} />
              Pricing data should be verified at official provider websites. See Data Sources section.
            </div>
          </div>

          <div className="space-y-16">
            <section id="model-guide"><ModelGuide /></section>
            <section id="task-selector"><TaskSelector /></section>
            <section id="task-examples"><TaskExamples /></section>
            <section id="calculator"><TokenCalculator /></section>
            <section id="compare"><ModelComparison /></section>
            <section id="monthly"><MonthlyCalculator /></section>
            <section id="agents"><AgentCalculator /></section>
            <section id="context"><ContextVisualizer /></section>
            <section id="caching"><CachingExplainer /></section>
            <section id="cheat-sheet"><CheatSheet /></section>
            <section id="model-details"><ModelDetails /></section>
            <section id="sources"><DataSources /></section>
          </div>
        </main>
      </div>
    </div>
  );
};
