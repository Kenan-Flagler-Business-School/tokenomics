import React, { useState, useMemo, useCallback } from 'react';
import {
  Cpu, DollarSign, Coins, BarChart3, TrendingUp, Zap, FileSpreadsheet,
  GraduationCap, BookOpen, FlaskConical, ChevronDown, Menu, X
} from 'lucide-react';

import { HomePage } from './components/HomePage';
import { LLMApp } from './components/llm/LLMApp';

import { DEFAULT_INPUTS } from './models/defaults';
import { SCENARIOS } from './models/scenarios';
import {
  computeBusinessMetrics,
  computeCostMetrics,
  computeTokenMetrics,
  computeVestingSchedule,
  computeTreasuryMetrics,
  computeStressTest,
  randomizeInputs,
  type StressFlags,
} from './calculations';

import { Section } from './components/shared/Section';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { BusinessModel } from './components/BusinessModel';
import { AICostEconomics } from './components/AICostEconomics';
import { TokenDesign } from './components/TokenDesign';
import { VestingSchedule } from './components/VestingSchedule';
import { TokenDemand } from './components/TokenDemand';
import { VelocitySimulator } from './components/VelocitySimulator';
import { ValuationModel } from './components/ValuationModel';
import { ScenarioPanel } from './components/ScenarioPanel';
import { SensitivityAnalysis } from './components/SensitivityAnalysis';
import { StressTest } from './components/StressTest';
import { TreasuryModel } from './components/TreasuryModel';
import { DiscussionQuestions } from './components/DiscussionQuestions';
import { StudentExperiment } from './components/StudentExperiment';

import type { SimulationInputs, ScenarioName } from './types';

const NAV_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'business', label: 'Business', icon: DollarSign },
  { id: 'costs', label: 'AI Costs', icon: Cpu },
  { id: 'token-design', label: 'Token Design', icon: Coins },
  { id: 'vesting', label: 'Vesting', icon: TrendingUp },
  { id: 'demand', label: 'Demand', icon: Zap },
  { id: 'velocity', label: 'Velocity', icon: Zap },
  { id: 'valuation', label: 'Valuation', icon: FileSpreadsheet },
  { id: 'scenarios', label: 'Scenarios', icon: FlaskConical },
  { id: 'sensitivity', label: 'Sensitivity', icon: BarChart3 },
  { id: 'stress', label: 'Stress Test', icon: BarChart3 },
  { id: 'treasury', label: 'Treasury', icon: DollarSign },
  { id: 'discussion', label: 'Discussion', icon: GraduationCap },
  { id: 'experiment', label: 'Experiment', icon: BookOpen },
];

const DEFAULT_STRESS: StressFlags = {
  doubleUserGrowth: false,
  computeCostPlus50: false,
  tokenUnlock30: false,
  tokenUsageMinus20: false,
  doubleVelocity: false,
  enterpriseMinus50: false,
};

export default function App() {
  const [currentApp, setCurrentApp] = useState<'home' | 'tokenomics' | 'llm'>('home');

  if (currentApp === 'home') {
    return <HomePage onSelect={setCurrentApp} />;
  }

  if (currentApp === 'llm') {
    return <LLMApp onBack={() => setCurrentApp('home')} />;
  }

  return <TokenomicsApp onBack={() => setCurrentApp('home')} />;
}

function TokenomicsApp({ onBack }: { onBack: () => void }) {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const [activeScenario, setActiveScenario] = useState<ScenarioName | 'custom'>('base');
  const [professorMode, setProfessorMode] = useState(false);
  const [stressFlags, setStressFlags] = useState<StressFlags>(DEFAULT_STRESS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derived calculations
  const biz = useMemo(() => computeBusinessMetrics(inputs), [inputs]);
  const cost = useMemo(() => computeCostMetrics(inputs, biz), [inputs, biz]);
  const tok = useMemo(() => computeTokenMetrics(inputs, biz), [inputs, biz]);
  const vestingData = useMemo(() => computeVestingSchedule(inputs), [inputs]);
  const treasury = useMemo(() => computeTreasuryMetrics(inputs, biz, cost), [inputs, biz, cost]);
  const stressResults = useMemo(() => computeStressTest(inputs, stressFlags), [inputs, stressFlags]);

  const handleChange = useCallback((patch: Partial<SimulationInputs>) => {
    setInputs(prev => ({ ...prev, ...patch }));
    setActiveScenario('custom');
  }, []);

  const handleScenarioSelect = useCallback((s: ScenarioName) => {
    setInputs(SCENARIOS[s]);
    setActiveScenario(s);
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setActiveScenario('base');
    setStressFlags(DEFAULT_STRESS);
  }, []);

  const handleRandomize = useCallback(() => {
    setInputs(prev => randomizeInputs(prev));
    setActiveScenario('custom');
  }, []);

  const handleStressToggle = useCallback((key: keyof StressFlags) => {
    setStressFlags(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors mr-1"
            >
              ← Home
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm">Axiom AI</span>
              <span className="ml-1.5 text-xs text-slate-400 hidden sm:inline">Tokenomics Simulation</span>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Scenario:</span>
            {(['conservative', 'base', 'expansion'] as ScenarioName[]).map(s => (
              <button
                key={s}
                onClick={() => handleScenarioSelect(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                  activeScenario === s
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {s === 'base' ? 'Base' : s === 'conservative' ? 'Conservative' : 'Expansion'}
              </button>
            ))}
            {activeScenario === 'custom' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 font-medium">Custom</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Professor Mode Toggle */}
            <button
              onClick={() => setProfessorMode(prev => !prev)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                professorMode
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap size={13} />
              {professorMode ? 'Professor Mode ON' : 'Professor Mode'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-3 grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-600 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Side Nav (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-44 bg-white border-r border-slate-200 flex-col py-4 overflow-y-auto z-30">
        <div className="px-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-44 pt-14">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Hero */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">AXM Token Economics</h1>
                <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
                  An interactive Kenan-Flagler Business School simulation exploring how token supply, demand, platform economics,
                  and velocity interact in a hypothetical AI platform. Adjust any parameter to see downstream effects.
                </p>
              </div>
              <div className="hidden md:block text-right text-xs text-slate-400 space-y-1">
                <div>Fictional company: <span className="font-medium text-slate-600">Axiom AI</span></div>
                <div>Token: <span className="font-medium text-violet-600">AXM</span></div>
                <div>Supply: <span className="font-mono font-medium text-slate-600">100,000,000</span></div>
              </div>
            </div>
          </div>

          <Section id="summary" title="Executive Summary" subtitle="Key performance indicators across token economics and business fundamentals.">
            <ExecutiveSummary inputs={inputs} biz={biz} cost={cost} tok={tok} treasury={treasury} />
          </Section>

          <Section id="business" title="Business Model" subtitle="Configure Axiom AI's revenue streams and user economics." badge="Section 2">
            <BusinessModel inputs={inputs} biz={biz} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="costs" title="AI Cost Economics" subtitle="Model the underlying economics of operating an AI inference platform." badge="Section 3">
            <AICostEconomics inputs={inputs} cost={cost} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="token-design" title="AXM Token Design" subtitle="Configure the 100M AXM token allocation across stakeholder categories." badge="Section 4">
            <TokenDesign inputs={inputs} tokenPrice={inputs.tokenPriceUSD} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="vesting" title="Vesting & Unlock Schedule" subtitle="Model token unlock dynamics over 60 months and their potential effects on circulating supply." badge="Section 5">
            <VestingSchedule inputs={inputs} vestingData={vestingData} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="demand" title="Token Demand Model" subtitle="Estimate annual token demand based on platform activity, staking, governance, and compute payments." badge="Section 6">
            <TokenDemand inputs={inputs} tok={tok} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="velocity" title="Token Velocity Simulator" subtitle="Explore how velocity affects the monetary base requirements and implied token price." badge="Section 7">
            <VelocitySimulator inputs={inputs} tok={tok} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="valuation" title="Token Valuation Model" subtitle="Simplified monetary model: P = Economic Activity ÷ (Circulating Supply × Velocity)" badge="Section 8">
            <ValuationModel inputs={inputs} tok={tok} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="scenarios" title="Scenario Analysis" subtitle="Compare Conservative, Base Case, and Expansion assumptions side by side." badge="Section 9">
            <ScenarioPanel activeScenario={activeScenario} onSelect={handleScenarioSelect} />
          </Section>

          <Section id="sensitivity" title="Sensitivity Analysis" subtitle="2D heatmap showing how implied token price varies across two dimensions simultaneously." badge="Section 10">
            <SensitivityAnalysis inputs={inputs} professorMode={professorMode} />
          </Section>

          <Section id="stress" title="Tokenomics Stress Test" subtitle="Apply simultaneous shocks to test platform resilience under adverse conditions." badge="Section 11">
            <StressTest flags={stressFlags} results={stressResults} onToggle={handleStressToggle} professorMode={professorMode} />
          </Section>

          <Section id="treasury" title="Treasury Model" subtitle="Model treasury composition, operating burn, revenue inflow, and operating runway." badge="Section 12">
            <TreasuryModel inputs={inputs} treasury={treasury} onChange={handleChange} professorMode={professorMode} />
          </Section>

          <Section id="discussion" title="Discussion Questions" subtitle="MBA-level questions for classroom discussion of AI platform tokenomics." badge="Section 13">
            <DiscussionQuestions />
          </Section>

          <Section id="experiment" title="Student Experiment Mode" subtitle="Reset, randomize, and save custom scenarios for exploration and comparison." badge="Section 14">
            <StudentExperiment
              inputs={inputs}
              onReset={handleReset}
              onRandomize={handleRandomize}
              onLoad={(loaded) => { setInputs(loaded); setActiveScenario('custom'); }}
            />
          </Section>

          <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Axiom AI Tokenomics Simulation is an educational tool designed for Kenan-Flagler Business School curricula.
              All data, companies, tokens, and financial figures are entirely fictional.
              This simulation does not constitute financial advice, investment recommendations, or predictions.
              Model outputs are illustrative only.
            </p>
            <p className="text-xs text-slate-300 mt-3">Built for educational use · All calculations are client-side</p>
          </footer>
        </div>
      </main>

      {/* Professor Mode floating indicator */}
      {professorMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setProfessorMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl shadow-lg text-xs font-medium hover:bg-amber-600 transition-all"
          >
            <GraduationCap size={14} />
            Professor Mode Active — Click to Disable
          </button>
        </div>
      )}
    </div>
  );
}
