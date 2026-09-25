import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { ScenarioName } from '../types';
import { SCENARIO_LABELS, SCENARIO_DESCRIPTIONS } from '../models/scenarios';

interface Props {
  activeScenario: ScenarioName | 'custom';
  onSelect: (s: ScenarioName) => void;
}

const SCENARIO_DETAILS: Record<ScenarioName, { items: string[]; color: string }> = {
  conservative: {
    color: 'border-slate-300 bg-slate-50',
    items: [
      '35K monthly active users (lower growth)',
      'Reduced AI consumption per user (24 units/mo)',
      'Higher compute costs ($4.50/1M tokens)',
      'Higher token velocity (7.5×)',
      'Lower token adoption (18%)',
      'Lower pricing ($0.65/unit)',
    ],
  },
  base: {
    color: 'border-blue-200 bg-blue-50',
    items: [
      '85K monthly active users (65% annual growth)',
      'Moderate AI consumption (42 units/month)',
      'Balanced compute costs ($3.20/1M tokens)',
      'Mid-range token velocity (4.2×)',
      'Moderate token adoption (35%)',
      'Platform cash-flow positive',
    ],
  },
  expansion: {
    color: 'border-emerald-200 bg-emerald-50',
    items: [
      '280K monthly active users (110% growth)',
      'Higher AI consumption per user (68 units/mo)',
      'Improved compute economics ($2.10/1M tokens)',
      'Lower token velocity (2.8×) — more holding',
      'Higher token utilization (55%)',
      'Larger enterprise contracts ($144K)',
    ],
  },
};

export const ScenarioPanel: React.FC<Props> = ({ activeScenario, onSelect }) => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Select a scenario preset to update all model inputs simultaneously. Each scenario represents a
        coherent set of assumptions — not a prediction. The purpose is to demonstrate how different
        starting assumptions produce meaningfully different outcomes.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {(['conservative', 'base', 'expansion'] as ScenarioName[]).map((key) => {
          const active = activeScenario === key;
          const details = SCENARIO_DETAILS[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                active
                  ? key === 'conservative'
                    ? 'border-slate-500 bg-slate-50 shadow-md'
                    : key === 'base'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800">{SCENARIO_LABELS[key]}</h3>
                {active && (
                  <CheckCircle
                    size={18}
                    className={
                      key === 'conservative'
                        ? 'text-slate-500'
                        : key === 'base'
                        ? 'text-blue-500'
                        : 'text-emerald-500'
                    }
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{SCENARIO_DESCRIPTIONS[key]}</p>
              <ul className="space-y-1">
                {details.items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {activeScenario === 'custom' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          You have modified inputs from a preset scenario — this is now a custom configuration.
          Select a scenario above to reload a preset, or continue adjusting individual parameters.
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
        <strong>Pedagogical note:</strong> These scenarios are named "Conservative", "Base Case", and "Expansion"
        deliberately — not "bear", "base", and "bull". The goal is to illustrate how different input assumptions
        flow through the model. Business outcomes depend on execution, market conditions, and factors outside
        any quantitative model.
      </div>
    </div>
  );
};
