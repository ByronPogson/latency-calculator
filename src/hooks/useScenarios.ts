import { useState, useCallback, useEffect } from 'react';
import type { Scenario, ScenarioWithResult } from '@/types/scenario';
import { calculateTransfer } from '@/lib/calculator';

const STORAGE_KEY = 'latency-calc-scenarios';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function loadFromStorage(): Scenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // Ignore storage errors
  }
}

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(scenarios);
  }, [scenarios]);

  const addScenario = useCallback((scenario: Omit<Scenario, 'id'>) => {
    const newScenario: Scenario = {
      ...scenario,
      id: generateId(),
    };
    setScenarios((prev) => [...prev, newScenario]);
    return newScenario;
  }, []);

  const updateScenario = useCallback((id: string, updates: Partial<Omit<Scenario, 'id'>>) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearScenarios = useCallback(() => {
    setScenarios([]);
  }, []);

  const reorderScenarios = useCallback((activeId: string, overId: string) => {
    setScenarios((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === activeId);
      const newIndex = prev.findIndex((s) => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newScenarios = [...prev];
      const [removed] = newScenarios.splice(oldIndex, 1);
      newScenarios.splice(newIndex, 0, removed);
      return newScenarios;
    });
  }, []);

  const scenariosWithResults: ScenarioWithResult[] = scenarios.map((scenario) => ({
    ...scenario,
    result: calculateTransfer(scenario),
  }));

  return {
    scenarios: scenariosWithResults,
    addScenario,
    updateScenario,
    deleteScenario,
    clearScenarios,
    reorderScenarios,
  };
}
