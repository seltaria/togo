import { formatMoney, timeBudgetLabels } from "../services/tripPlanner";
import type { SavedPlan, TripOption } from "../types";

interface SavedPlansProps {
  savedPlans: SavedPlan[];
  tripOptions: TripOption[];
  onOpen: (option: TripOption) => void;
  onDelete: (planId: string) => void;
}

export function SavedPlans({
  savedPlans,
  tripOptions,
  onOpen,
  onDelete,
}: SavedPlansProps) {
  if (savedPlans.length === 0) {
    return (
      <section className="panel empty-state">
        <h1>Мои планы</h1>
        <p>Сохраненные варианты появятся здесь и будут доступны офлайн в этом браузере.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="eyebrow">Мои планы</div>
      <h1>Сохраненные поездки и черновики</h1>
      <div className="saved-stack">
        {savedPlans.map((plan) => {
          const trip = tripOptions.find((option) => option.id === plan.tripId);
          if (!trip) {
            return null;
          }

          return (
            <article className="saved-card" key={plan.id}>
              <div>
                <span>{new Date(plan.savedAt).toLocaleString("ru-RU")}</span>
                <h2>{trip.title}</h2>
                <p>
                  {timeBudgetLabels[plan.params.timeBudget]}, бюджет{" "}
                  {formatMoney(plan.params.maxBudgetRub)}
                </p>
              </div>
              <div className="button-row">
                <button className="primary-button" onClick={() => onOpen(trip)} type="button">
                  Открыть
                </button>
                <button className="ghost-button" onClick={() => onDelete(plan.id)} type="button">
                  Удалить
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
