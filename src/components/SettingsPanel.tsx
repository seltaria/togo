import { transportLabels } from "../services/tripPlanner";
import type { TransportKind, UserPreferences } from "../types";

interface SettingsPanelProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

const transportOptions = Object.keys(transportLabels) as TransportKind[];

function toggleTransport(values: TransportKind[], transport: TransportKind) {
  return values.includes(transport)
    ? values.filter((current) => current !== transport)
    : [...values, transport];
}

export function SettingsPanel({ preferences, onChange }: SettingsPanelProps) {
  const updatePreferences = (patch: Partial<UserPreferences>) => {
    onChange({ ...preferences, ...patch });
  };

  const updateHome = (patch: Partial<UserPreferences["homeLocation"]>) => {
    updatePreferences({
      homeLocation: {
        ...preferences.homeLocation,
        ...patch,
      },
    });
  };

  return (
    <section className="panel">
      <div className="eyebrow">Настройки</div>
      <h1>Домашняя зона и приватность</h1>
      <p className="muted">
        Домашняя локация хранится только в localStorage этого браузера. Для реального
        продукта стоит добавить явное согласие на геолокацию и возможность удалить данные.
      </p>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="city">Город</label>
          <input
            id="city"
            onChange={(event) => updateHome({ city: event.target.value })}
            value={preferences.homeLocation.city}
          />
        </div>
        <div className="field-group">
          <label htmlFor="district">Район или точка дома</label>
          <input
            id="district"
            onChange={(event) => updateHome({ district: event.target.value })}
            value={preferences.homeLocation.district}
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="nearby-radius">
          Что считается рядом: {preferences.homeLocation.nearbyRadiusKm} км
        </label>
        <input
          id="nearby-radius"
          max="150"
          min="1"
          onChange={(event) => updateHome({ nearbyRadiusKm: Number(event.target.value) })}
          type="range"
          value={preferences.homeLocation.nearbyRadiusKm}
        />
      </div>

      <div className="field-group">
        <label htmlFor="default-road">
          Дорога по умолчанию: {preferences.homeLocation.defaultMaxRoadMinutes} мин
        </label>
        <input
          id="default-road"
          max="360"
          min="0"
          onChange={(event) =>
            updateHome({ defaultMaxRoadMinutes: Number(event.target.value) })
          }
          step="15"
          type="range"
          value={preferences.homeLocation.defaultMaxRoadMinutes}
        />
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="default-people">Людей по умолчанию</label>
          <input
            id="default-people"
            max="8"
            min="1"
            onChange={(event) =>
              updatePreferences({ peopleCount: Number(event.target.value) })
            }
            type="number"
            value={preferences.peopleCount}
          />
        </div>
        <div className="field-group">
          <label htmlFor="theme">Тема</label>
          <select
            id="theme"
            onChange={(event) =>
              updatePreferences({ theme: event.target.value as UserPreferences["theme"] })
            }
            value={preferences.theme}
          >
            <option value="light">Светлая</option>
            <option value="dark">Темная</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <span>Предпочитаемый транспорт</span>
        <div className="chip-grid">
          {transportOptions.map((transport) => (
            <button
              className={
                preferences.preferredTransports.includes(transport)
                  ? "chip is-active"
                  : "chip"
              }
              key={transport}
              onClick={() =>
                updatePreferences({
                  preferredTransports: toggleTransport(
                    preferences.preferredTransports,
                    transport,
                  ),
                })
              }
              type="button"
            >
              {transportLabels[transport]}
            </button>
          ))}
        </div>
      </div>

      <section className="integration-note">
        <h2>Что заложено для следующих этапов</h2>
        <ul>
          <li>Официальные API погоды вместо моков.</li>
          <li>Партнерские API билетов, жилья и ресторанов без скрейпинга.</li>
          <li>Буферы на аэропорт, вокзал, пересадки и дорогу до точки старта.</li>
          <li>Сезонность, бесплатные дни музеев и события.</li>
        </ul>
      </section>
    </section>
  );
}
