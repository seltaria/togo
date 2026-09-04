import {
  restModeLabels,
  styleLabels,
  timeBudgetLabels,
  transportLabels,
} from "../services/tripPlanner";
import type {
  DestinationMode,
  RestMode,
  TimeBudget,
  TransportKind,
  TravelStyle,
  TripSearchParams,
  UserPreferences,
} from "../types";

interface PlannerFormProps {
  params: TripSearchParams;
  preferences: UserPreferences;
  onChange: (params: TripSearchParams) => void;
}

const timeBudgetOptions = Object.keys(timeBudgetLabels) as TimeBudget[];
const restModeOptions = Object.keys(restModeLabels) as RestMode[];
const transportOptions = Object.keys(transportLabels) as TransportKind[];
const styleOptions = Object.keys(styleLabels) as TravelStyle[];

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

export function PlannerForm({ params, preferences, onChange }: PlannerFormProps) {
  const updateParams = (patch: Partial<TripSearchParams>) => {
    onChange({ ...params, ...patch });
  };

  const budgetLabel = params.budgetPerPerson
    ? "Лимит на человека"
    : "Общий лимит на поездку";

  return (
    <section className="panel hero-panel" aria-labelledby="planner-heading">
      <div className="eyebrow">Быстрый подбор</div>
      <h1 id="planner-heading">Куда выбраться, когда появилось свободное время?</h1>
      <p className="hero-panel__lead">
        Дом: {preferences.homeLocation.district}, радиус рядом -
        {" "}
        {preferences.homeLocation.nearbyRadiusKm} км. Настройки можно поменять во вкладке
        "Дом".
      </p>

      <div className="field-group">
        <label htmlFor="time-budget">Сколько есть времени</label>
        <select
          id="time-budget"
          value={params.timeBudget}
          onChange={(event) =>
            updateParams({ timeBudget: event.target.value as TimeBudget })
          }
        >
          {timeBudgetOptions.map((option) => (
            <option key={option} value={option}>
              {timeBudgetLabels[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <span>Тип отдыха</span>
        <div className="chip-grid">
          {restModeOptions.map((mode) => (
            <button
              className={params.restMode === mode ? "chip is-active" : "chip"}
              key={mode}
              onClick={() => updateParams({ restMode: mode })}
              type="button"
            >
              {restModeLabels[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group two-columns">
        <label htmlFor="road-minutes">
          Готов тратить на дорогу: {params.maxRoadMinutes} мин
        </label>
        <input
          id="road-minutes"
          max="1440"
          min="0"
          onChange={(event) =>
            updateParams({ maxRoadMinutes: Number(event.target.value) })
          }
          step="15"
          type="range"
          value={params.maxRoadMinutes}
        />
      </div>

      <div className="field-group">
        <span>Направление</span>
        <div className="segmented">
          {(["surprise", "specific"] as DestinationMode[]).map((mode) => (
            <button
              className={params.destinationMode === mode ? "is-active" : ""}
              key={mode}
              onClick={() => updateParams({ destinationMode: mode })}
              type="button"
            >
              {mode === "surprise" ? "Не важно куда" : "Важно куда"}
            </button>
          ))}
        </div>
        {params.destinationMode === "specific" ? (
          <input
            aria-label="Город или регион"
            onChange={(event) => updateParams({ destinationQuery: event.target.value })}
            placeholder="Например: Казань, Гатчина, Пушкин"
            type="search"
            value={params.destinationQuery}
          />
        ) : null}
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="budget">{budgetLabel}</label>
          <input
            id="budget"
            min="0"
            onChange={(event) =>
              updateParams({ maxBudgetRub: Number(event.target.value) })
            }
            step="500"
            type="number"
            value={params.maxBudgetRub}
          />
        </div>
        <div className="field-group">
          <label htmlFor="people">Количество человек</label>
          <input
            id="people"
            max="8"
            min="1"
            onChange={(event) =>
              updateParams({ peopleCount: Number(event.target.value) })
            }
            type="number"
            value={params.peopleCount}
          />
        </div>
      </div>

      <div className="switch-row">
        <label>
          <input
            checked={params.budgetPerPerson}
            onChange={(event) =>
              updateParams({ budgetPerPerson: event.target.checked })
            }
            type="checkbox"
          />
          Считать бюджет на каждого отдельно
        </label>
        <label>
          <input
            checked={params.freeOnly}
            onChange={(event) => updateParams({ freeOnly: event.target.checked })}
            type="checkbox"
          />
          Отдохнуть бесплатно
        </label>
      </div>

      <div className="field-group">
        <span>Транспорт</span>
        <div className="chip-grid">
          {transportOptions.map((transport) => (
            <button
              className={
                params.selectedTransports.includes(transport)
                  ? "chip is-active"
                  : "chip"
              }
              key={transport}
              onClick={() =>
                updateParams({
                  selectedTransports: toggleValue(params.selectedTransports, transport),
                })
              }
              type="button"
            >
              {transportLabels[transport]}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <span>Настроение</span>
        <div className="chip-grid">
          {styleOptions.map((style) => (
            <button
              className={params.styles.includes(style) ? "chip is-active" : "chip"}
              key={style}
              onClick={() =>
                updateParams({ styles: toggleValue(params.styles, style) })
              }
              type="button"
            >
              {styleLabels[style]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
