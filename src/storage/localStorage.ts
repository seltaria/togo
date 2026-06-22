import { checklistTemplates, defaultPreferences } from "../data/mockData";
import type { Checklist, SavedPlan, UserPreferences } from "../types";

const preferencesKey = "togo.preferences";
const savedPlansKey = "togo.savedPlans";
const checklistKey = "togo.checklists";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadPreferences(): UserPreferences {
  return readJson(preferencesKey, defaultPreferences);
}

export function savePreferences(preferences: UserPreferences): void {
  writeJson(preferencesKey, preferences);
}

export function loadSavedPlans(): SavedPlan[] {
  return readJson(savedPlansKey, []);
}

export function saveSavedPlans(savedPlans: SavedPlan[]): void {
  writeJson(savedPlansKey, savedPlans);
}

export function loadChecklists(): Checklist[] {
  return readJson(checklistKey, checklistTemplates);
}

export function saveChecklists(checklists: Checklist[]): void {
  writeJson(checklistKey, checklists);
}
