import type { SavedScenario, SimulationInputs } from '../types';

const KEY = 'axiom_saved_scenarios';

export function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedScenario[];
  } catch {
    return [];
  }
}

export function saveScenario(name: string, inputs: SimulationInputs): SavedScenario {
  const scenario: SavedScenario = {
    id: `sc_${Date.now()}`,
    name,
    inputs,
    createdAt: new Date().toISOString(),
  };
  const existing = loadScenarios();
  localStorage.setItem(KEY, JSON.stringify([...existing, scenario]));
  return scenario;
}

export function deleteScenario(id: string): void {
  const existing = loadScenarios().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(existing));
}
