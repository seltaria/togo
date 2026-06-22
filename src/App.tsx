import { useEffect, useMemo, useState } from "react";
import { BottomNav, type AppView } from "./components/BottomNav";
import { ChecklistManager } from "./components/ChecklistManager";
import { PlannerForm } from "./components/PlannerForm";
import { SavedPlans } from "./components/SavedPlans";
import { SettingsPanel } from "./components/SettingsPanel";
import { TripCard } from "./components/TripCard";
import { TripDetail } from "./components/TripDetail";
import { checklistTemplates, defaultSearchParams, tripOptions } from "./data/mockData";
import { getRecommendedOptions } from "./services/tripPlanner";
import {
  loadChecklists,
  loadPreferences,
  loadSavedPlans,
  saveChecklists,
  savePreferences,
  saveSavedPlans,
} from "./storage/localStorage";
import type { Checklist, SavedPlan, TripOption, TripSearchParams } from "./types";
import "./styles.css";

function createId(prefix: string): string {
  if ("randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function cloneChecklists(checklists: Checklist[]): Checklist[] {
  return checklists.map((checklist) => ({
    ...checklist,
    items: checklist.items.map((item) => ({ ...item })),
  }));
}

export default function App() {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [params, setParams] = useState<TripSearchParams>({
    ...defaultSearchParams,
    peopleCount: preferences.peopleCount,
    maxRoadMinutes: preferences.homeLocation.defaultMaxRoadMinutes,
    selectedTransports: preferences.preferredTransports,
  });
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(loadSavedPlans);
  const [checklists, setChecklists] = useState<Checklist[]>(() => {
    const savedChecklists = loadChecklists();
    return savedChecklists.length > 0 ? savedChecklists : checklistTemplates;
  });
  const [selectedTrip, setSelectedTrip] = useState<TripOption | null>(null);
  const [activeView, setActiveView] = useState<AppView>("planner");

  const results = useMemo(() => getRecommendedOptions(params), [params]);

  useEffect(() => {
    savePreferences(preferences);
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences]);

  useEffect(() => {
    saveSavedPlans(savedPlans);
  }, [savedPlans]);

  useEffect(() => {
    saveChecklists(checklists);
  }, [checklists]);

  const openTrip = (option: TripOption) => {
    setSelectedTrip(option);
    setActiveView("details");
  };

  const saveTrip = (option: TripOption) => {
    setSavedPlans((currentPlans) => {
      const existingPlan = currentPlans.find((plan) => plan.tripId === option.id);
      const nextPlan: SavedPlan = {
        id: existingPlan?.id ?? createId("plan"),
        tripId: option.id,
        savedAt: new Date().toISOString(),
        params,
        checklist: cloneChecklists(
          checklists.filter((checklist) => option.checklistIds.includes(checklist.id)),
        ),
      };

      if (existingPlan) {
        return currentPlans.map((plan) =>
          plan.id === existingPlan.id ? nextPlan : plan,
        );
      }

      return [nextPlan, ...currentPlans];
    });
  };

  const deleteSavedPlan = (planId: string) => {
    setSavedPlans((currentPlans) =>
      currentPlans.filter((plan) => plan.id !== planId),
    );
  };

  const renderPlanner = () => (
    <>
      <PlannerForm params={params} preferences={preferences} onChange={setParams} />
      <section className="results-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Подходящие идеи</div>
            <h2>{results.length > 0 ? `Найдено: ${results.length}` : "Пока нет совпадений"}</h2>
          </div>
          <span className="pill">MVP с моковыми данными</span>
        </div>

        {results.length > 0 ? (
          <div className="trip-list">
            {results.map((option) => (
              <TripCard
                isSaved={savedPlans.some((plan) => plan.tripId === option.id)}
                key={option.id}
                onOpen={openTrip}
                onSave={saveTrip}
                option={option}
                params={params}
              />
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <h3>Попробуйте расширить фильтры</h3>
            <p>
              Увеличьте время в дороге, бюджет или выберите "не важно куда". В реальном
              продукте здесь можно показывать ближайшие альтернативы с объяснением.
            </p>
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="ToGo">
          <span>ToGo</span>
        </a>
        <div>
          <strong>{preferences.homeLocation.city}</strong>
          <small>Планировщик отдыха</small>
        </div>
      </header>

      <main id="top" className="app-main">
        {activeView === "planner" ? renderPlanner() : null}
        {activeView === "details" ? (
          <TripDetail
            isSaved={
              selectedTrip
                ? savedPlans.some((plan) => plan.tripId === selectedTrip.id)
                : false
            }
            onSave={saveTrip}
            option={selectedTrip}
            params={params}
          />
        ) : null}
        {activeView === "checklists" ? (
          <ChecklistManager
            checklists={checklists}
            onChange={setChecklists}
            selectedTrip={selectedTrip}
          />
        ) : null}
        {activeView === "saved" ? (
          <SavedPlans
            onDelete={deleteSavedPlan}
            onOpen={openTrip}
            savedPlans={savedPlans}
            tripOptions={tripOptions}
          />
        ) : null}
        {activeView === "settings" ? (
          <SettingsPanel preferences={preferences} onChange={setPreferences} />
        ) : null}
      </main>

      <BottomNav activeView={activeView} onChange={setActiveView} />
    </div>
  );
}
