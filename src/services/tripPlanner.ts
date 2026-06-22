import { tripOptions } from "../data/mockData";
import type {
  RestMode,
  TimeBudget,
  TransportKind,
  TravelStyle,
  TripOption,
  TripSearchParams,
} from "../types";

export interface CostBreakdown {
  roadCostRub: number;
  accommodationCostRub: number;
  foodCostRub: number;
  activityCostRub: number;
  totalCostRub: number;
  costPerPersonRub: number;
}

export const timeBudgetLabels: Record<TimeBudget, string> = {
  evening: "Вечер после работы",
  "half-day": "Половина дня",
  "one-day": "Один день",
  "two-days": "Два дня",
  "few-days": "Несколько дней",
  week: "Неделя отпуска",
};

export const restModeLabels: Record<RestMode, string> = {
  home: "Остаться дома",
  nearby: "Рядом с домом",
  "short-trip": "Недалеко съездить",
  travel: "Уехать",
};

export const transportLabels: Record<TransportKind, string> = {
  walk: "Пешком",
  taxi: "Такси",
  car: "Авто",
  "suburban-train": "Электричка",
  train: "Поезд",
  bus: "Автобус",
  plane: "Самолет",
  mixed: "С пересадками",
};

export const styleLabels: Record<TravelStyle, string> = {
  free: "Бесплатно",
  romantic: "Романтика",
  family: "Семья",
  friends: "С друзьями",
  active: "Активно",
  calm: "Спокойно",
  culture: "Культура",
  nature: "Природа",
  food: "Еда",
};

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "RUB",
  }).format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) {
    return "без дороги";
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) {
    return `${restMinutes} мин`;
  }

  if (restMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${restMinutes} мин`;
}

export function getNights(timeBudget: TimeBudget): number {
  switch (timeBudget) {
    case "evening":
    case "half-day":
    case "one-day":
      return 0;
    case "two-days":
      return 1;
    case "few-days":
      return 2;
    case "week":
      return 6;
  }
}

export function getMealMultiplier(timeBudget: TimeBudget): number {
  switch (timeBudget) {
    case "evening":
      return 1;
    case "half-day":
    case "one-day":
      return 2;
    case "two-days":
      return 4;
    case "few-days":
      return 6;
    case "week":
      return 12;
  }
}

export function getAvailableTransports(
  option: TripOption,
  selectedTransports: TransportKind[],
) {
  if (selectedTransports.length === 0) {
    return option.transportOptions;
  }

  return option.transportOptions.filter((transport) =>
    selectedTransports.includes(transport.kind),
  );
}

export function getBestTransport(option: TripOption, params: TripSearchParams) {
  const available = getAvailableTransports(option, params.selectedTransports);

  return [...available].sort((left, right) => {
    const leftScore = left.pricePerPersonRub * params.peopleCount + left.durationMinutes * 12;
    const rightScore = right.pricePerPersonRub * params.peopleCount + right.durationMinutes * 12;
    return leftScore - rightScore;
  })[0];
}

export function estimateCost(
  option: TripOption,
  params: TripSearchParams,
): CostBreakdown {
  const peopleCount = Math.max(1, params.peopleCount);
  const bestTransport = getBestTransport(option, params);
  const nights = getNights(params.timeBudget);
  const cheapestAccommodation = [...option.accommodations].sort(
    (left, right) => left.pricePerNightRub - right.pricePerNightRub,
  )[0];
  const cheapestFood = [...option.foodPlaces].sort(
    (left, right) => left.averageBillRub - right.averageBillRub,
  )[0];

  const roadCostRub = (bestTransport?.pricePerPersonRub ?? 0) * peopleCount;
  const accommodationCostRub =
    nights > 0 && cheapestAccommodation
      ? cheapestAccommodation.pricePerNightRub * nights
      : 0;
  const foodCostRub =
    (cheapestFood?.averageBillRub ?? 0) *
    peopleCount *
    getMealMultiplier(params.timeBudget);
  const activityCostRub = params.freeOnly
    ? 0
    : option.baseActivityCostRub * peopleCount;
  const totalCostRub =
    roadCostRub + accommodationCostRub + foodCostRub + activityCostRub;

  return {
    roadCostRub,
    accommodationCostRub,
    foodCostRub,
    activityCostRub,
    totalCostRub,
    costPerPersonRub: Math.round(totalCostRub / peopleCount),
  };
}

function isBudgetMatch(option: TripOption, params: TripSearchParams): boolean {
  const cost = estimateCost(option, params);
  const comparableCost = params.budgetPerPerson
    ? cost.costPerPersonRub
    : cost.totalCostRub;

  return comparableCost <= params.maxBudgetRub;
}

function isDestinationMatch(option: TripOption, params: TripSearchParams): boolean {
  if (params.destinationMode === "surprise") {
    return true;
  }

  const query = params.destinationQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return `${option.destination} ${option.region}`.toLowerCase().includes(query);
}

function isTransportMatch(option: TripOption, params: TripSearchParams): boolean {
  return getAvailableTransports(option, params.selectedTransports).length > 0;
}

function isStyleMatch(option: TripOption, params: TripSearchParams): boolean {
  if (params.styles.length === 0) {
    return true;
  }

  return params.styles.some((style) => option.styles.includes(style));
}

function scoreOption(option: TripOption, params: TripSearchParams): number {
  const cost = estimateCost(option, params);
  const styleMatches = params.styles.filter((style) =>
    option.styles.includes(style),
  ).length;
  const budgetBonus = isBudgetMatch(option, params) ? 80 : -120;
  const roadPenalty = Math.max(0, option.roadMinutes - params.maxRoadMinutes);
  const freeBonus = params.freeOnly && option.isFreeFriendly ? 60 : 0;

  return (
    styleMatches * 25 +
    budgetBonus +
    freeBonus -
    roadPenalty -
    Math.round(cost.totalCostRub / 1200)
  );
}

export function findTripOptions(params: TripSearchParams): TripOption[] {
  return tripOptions
    .filter((option) => option.timeBudgets.includes(params.timeBudget))
    .filter((option) => option.restMode === params.restMode)
    .filter((option) => option.roadMinutes <= params.maxRoadMinutes || params.restMode === "travel")
    .filter((option) => params.peopleCount >= option.minPeople && params.peopleCount <= option.maxPeople)
    .filter((option) => !params.freeOnly || option.isFreeFriendly)
    .filter((option) => isDestinationMatch(option, params))
    .filter((option) => isTransportMatch(option, params))
    .filter((option) => isStyleMatch(option, params))
    .sort((left, right) => scoreOption(right, params) - scoreOption(left, params));
}

export function getRecommendedOptions(params: TripSearchParams): TripOption[] {
  const strictMatches = findTripOptions(params).filter((option) =>
    isBudgetMatch(option, params),
  );

  if (strictMatches.length > 0) {
    return strictMatches;
  }

  return findTripOptions(params);
}
