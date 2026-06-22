import {
  estimateCost,
  formatDuration,
  formatMoney,
  getBestTransport,
  restModeLabels,
  styleLabels,
  transportLabels,
} from "../services/tripPlanner";
import type { TripOption, TripSearchParams } from "../types";

interface TripCardProps {
  option: TripOption;
  params: TripSearchParams;
  isSaved: boolean;
  onOpen: (option: TripOption) => void;
  onSave: (option: TripOption) => void;
}

export function TripCard({ option, params, isSaved, onOpen, onSave }: TripCardProps) {
  const bestTransport = getBestTransport(option, params);
  const cost = estimateCost(option, params);
  const budgetLimit = params.budgetPerPerson
    ? cost.costPerPersonRub
    : cost.totalCostRub;
  const isWithinBudget = budgetLimit <= params.maxBudgetRub;

  return (
    <article className="trip-card">
      <div className="trip-card__media">
        <span>{option.destination.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="trip-card__body">
        <div className="trip-card__topline">
          <span>{restModeLabels[option.restMode]}</span>
          <span>{option.distanceKm} км</span>
        </div>
        <h2>{option.title}</h2>
        <p>{option.description}</p>

        <div className="metrics">
          <div>
            <span>Дорога</span>
            <strong>{formatDuration(bestTransport?.durationMinutes ?? option.roadMinutes)}</strong>
          </div>
          <div>
            <span>Итого</span>
            <strong>{formatMoney(cost.totalCostRub)}</strong>
          </div>
          <div>
            <span>На человека</span>
            <strong>{formatMoney(cost.costPerPersonRub)}</strong>
          </div>
        </div>

        <div className="mini-grid">
          <span>
            {bestTransport ? transportLabels[bestTransport.kind] : "Маршрут"}
            {bestTransport ? `: ${formatMoney(bestTransport.pricePerPersonRub)}` : ""}
          </span>
          <span>
            Погода: {option.destinationWeather.temperatureC}°C,{" "}
            {option.destinationWeather.condition.toLowerCase()}
          </span>
          <span>
            Жилье:{" "}
            {option.accommodations[0]
              ? `от ${formatMoney(option.accommodations[0].pricePerNightRub)}`
              : "не нужно"}
          </span>
          <span>{isWithinBudget ? "В бюджете" : "Выше бюджета"}</span>
        </div>

        <div className="tag-row">
          {option.styles.slice(0, 4).map((style) => (
            <span className="tag" key={style}>
              {styleLabels[style]}
            </span>
          ))}
        </div>

        <div className="preview-list">
          {option.attractions.slice(0, 3).map((attraction) => (
            <span key={attraction.id}>{attraction.title}</span>
          ))}
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={() => onOpen(option)} type="button">
            Открыть план
          </button>
          <button className="ghost-button" onClick={() => onSave(option)} type="button">
            {isSaved ? "Сохранено" : "Сохранить"}
          </button>
        </div>
      </div>
    </article>
  );
}
