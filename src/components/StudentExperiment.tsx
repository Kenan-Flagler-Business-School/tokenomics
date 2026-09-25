import React, { useState } from 'react';
import { Save, Trash2, RotateCcw, Shuffle, FolderOpen } from 'lucide-react';
import { loadScenarios, saveScenario, deleteScenario } from '../utils/storage';
import { randomizeInputs } from '../calculations';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, SavedScenario } from '../types';

interface Props {
  inputs: SimulationInputs;
  onReset: () => void;
  onRandomize: () => void;
  onLoad: (inputs: SimulationInputs) => void;
}

export const StudentExperiment: React.FC<Props> = ({ inputs, onReset, onRandomize, onLoad }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [saved, setSaved] = useState<SavedScenario[]>(() => loadScenarios());
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    saveScenario(scenarioName.trim(), inputs);
    setSaved(loadScenarios());
    setScenarioName('');
    setSaveMsg(`"${scenarioName.trim()}" saved!`);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    deleteScenario(id);
    setSaved(loadScenarios());
  };

  const handleLoad = (scenario: SavedScenario) => {
    onLoad(scenario.inputs);
  };

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800 leading-relaxed">
        Use the tools below to reset the simulation, randomize assumptions, or save your own custom scenarios.
        Saved scenarios persist in your browser's local storage.
      </div>

      {/* Action buttons */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Simulation Controls</h3>
          <div className="space-y-3">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
            >
              <RotateCcw size={16} />
              Reset to Default Assumptions
            </button>
            <button
              onClick={onRandomize}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-all"
            >
              <Shuffle size={16} />
              Randomize All Assumptions
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Randomize generates a new set of plausible (but random) model inputs to explore unexpected combinations.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Save Current Scenario</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scenario name..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
            <button
              onClick={handleSave}
              disabled={!scenarioName.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-all"
            >
              <Save size={14} />
              Save
            </button>
          </div>
          {saveMsg && (
            <p className="mt-2 text-xs text-emerald-600 font-medium">{saveMsg}</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Saved locally in browser storage. Use this to compare multiple scenarios side by side.
          </p>
        </div>
      </div>

      {/* Saved scenarios */}
      {saved.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Saved Scenarios ({saved.length})</h3>
          </div>
          <div className="space-y-2">
            {saved.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{scenario.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Saved {new Date(scenario.createdAt).toLocaleDateString()} ·{' '}
                    {fmt.compact(scenario.inputs.monthlyActiveUsers)} MAU ·{' '}
                    {fmt.usd(scenario.inputs.tokenPriceUSD, 2)} token price
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleLoad(scenario)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-all"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(scenario.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {saved.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-400">
          No saved scenarios yet. Adjust the model and save a configuration above.
        </div>
      )}
    </div>
  );
};
