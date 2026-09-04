import {
  estimateCost,
  formatDuration,
  formatMoney,
  getAvailableTransports,
  getNights,
  transportLabels,
} from "../services/tripPlanner";
import type { TripOption, TripSearchParams } from "../types";

interface TripDetailProps {
  option: TripOption | null;
  params: TripSearchParams;
  isSaved: boolean;
  onSave: (option: TripOption) => void;
}

export function TripDetail({ option, params, isSaved, onSave }: TripDetailProps) {
  if (!option) {
    return (
      <section className="panel empty-state">
        <h1>Выберите вариант</h1>
        <p>Откройте карточку из подбора, чтобы увидеть дорогу, жилье, еду и чек-листы.</p>
      </section>
    );
  }

  const cost = estimateCost(option, params);
  const transports = getAvailableTransports(option, params.selectedTransports);
  const nights = getNights(params.timeBudget);

  return (
    <section className="detail-page">
      <div className="detail-hero panel">
        <div className="eyebrow">{option.region}</div>
        <h1>{option.title}</h1>
        <p>{option.description}</p>
        <div className="detail-hero__map" role="img" aria-label="Заглушка карты">
          <span>{option.destination}</span>
        </div>
        <div className="button-row">
          <button className="primary-button" onClick={() => onSave(option)} type="button">
            {isSaved ? "План сохранен" : "Сохранить план"}
          </button>
          <a
            className="ghost-button"
            href={`https://www.google.com/maps/search/${encodeURIComponent(option.destination)}`}
            rel="noreferrer"
            target="_blank"
          >
            Открыть карту
          </a>
        </div>
      </div>

      <section className="panel">
        <h2>Почему подходит</h2>
        <div className="reason-grid">
          {option.whyFits.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Стоимость</h2>
        <div className="cost-grid">
          <div>
            <span>Дорога</span>
            <strong>{formatMoney(cost.roadCostRub)}</strong>
          </div>
          <div>
            <span>Жилье</span>
            <strong>
              {nights > 0 ? formatMoney(cost.accommodationCostRub) : "не нужно"}
            </strong>
          </div>
          <div>
            <span>Еда</span>
            <strong>{formatMoney(cost.foodCostRub)}</strong>
          </div>
          <div>
            <span>Активности</span>
            <strong>{formatMoney(cost.activityCostRub)}</strong>
          </div>
        </div>
        <div className="total-line">
          <span>Всего</span>
          <strong>{formatMoney(cost.totalCostRub)}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Дорога</h2>
        <div className="stack">
          {transports.map((transport) => (
            <article className="option-row" key={`${transport.title}-${transport.departure}`}>
              <div>
                <strong>{transport.title}</strong>
                <span>
                  {transport.from} - {transport.to}
                </span>
                {transport.transfers.length > 0 ? (
                  <small>Пересадки: {transport.transfers.join(", ")}</small>
                ) : (
                  <small>Без пересадок</small>
                )}
              </div>
              <div className="option-row__meta">
                <span>{transportLabels[transport.kind]}</span>
                <strong>{formatMoney(transport.pricePerPersonRub)} / чел.</strong>
                <small>{formatDuration(transport.durationMinutes)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Погода</h2>
        <div className="weather-grid">
          {[option.homeWeather, option.destinationWeather].map((weather) => (
            <article key={weather.city}>
              <span>{weather.city}</span>
              <strong>
                {weather.temperatureC}°C, {weather.condition}
              </strong>
              <small>
                Ощущается как {weather.feelsLikeC}°C, ветер {weather.windMps} м/с.
                {weather.precipitation}
              </small>
              <p>{weather.clothingHint}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Куда сходить</h2>
        <div className="card-grid">
          {option.attractions.map((attraction) => (
            <article className="small-card" key={attraction.id}>
              <span>{attraction.category}</span>
              <h3>{attraction.title}</h3>
              <p>{attraction.description}</p>
              <small>{attraction.isFree ? "Бесплатно" : "Платно"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Где поесть</h2>
        <div className="card-grid">
          {option.foodPlaces.map((place) => (
            <article className="small-card" key={place.id}>
              <span>{place.cuisine}</span>
              <h3>{place.title}</h3>
              <p>
                {place.area}, средний чек {formatMoney(place.averageBillRub)}
              </p>
              <small>{place.tags.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Где жить</h2>
        {option.accommodations.length > 0 ? (
          <div className="card-grid">
            {option.accommodations.map((stay) => (
              <article className="small-card" key={stay.id}>
                <span>{stay.source}</span>
                <h3>{stay.title}</h3>
                <p>
                  {formatMoney(stay.pricePerNightRub)} / ночь, {stay.distanceToCenterKm} км
                  до центра
                </p>
                <small>Рейтинг {stay.rating}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Ночевка не требуется для этого сценария.</p>
        )}
      </section>
    </section>
  );
}
