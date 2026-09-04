export type TimeBudget =
  | "evening"
  | "half-day"
  | "one-day"
  | "two-days"
  | "few-days"
  | "week";

export type RestMode = "home" | "nearby" | "short-trip" | "travel";

export type DestinationMode = "specific" | "surprise";

export type TransportKind =
  | "walk"
  | "taxi"
  | "car"
  | "suburban-train"
  | "train"
  | "bus"
  | "plane"
  | "mixed";

export type TravelStyle =
  | "free"
  | "romantic"
  | "family"
  | "friends"
  | "active"
  | "calm"
  | "culture"
  | "nature"
  | "food";

export interface HomeLocation {
  city: string;
  district: string;
  lat: number;
  lon: number;
  nearbyRadiusKm: number;
  defaultMaxRoadMinutes: number;
}

export interface UserPreferences {
  homeLocation: HomeLocation;
  peopleCount: number;
  currency: "RUB";
  preferredTransports: TransportKind[];
  theme: "light" | "dark";
}

export interface TripSearchParams {
  timeBudget: TimeBudget;
  restMode: RestMode;
  destinationMode: DestinationMode;
  destinationQuery: string;
  maxRoadMinutes: number;
  maxBudgetRub: number;
  peopleCount: number;
  budgetPerPerson: boolean;
  freeOnly: boolean;
  selectedTransports: TransportKind[];
  styles: TravelStyle[];
}

export interface WeatherInfo {
  city: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  windMps: number;
  precipitation: string;
  clothingHint: string;
}

export interface TransportOption {
  kind: TransportKind;
  title: string;
  from: string;
  to: string;
  durationMinutes: number;
  pricePerPersonRub: number;
  departure: string;
  arrival: string;
  transfers: string[];
  source: string;
}

export interface AccommodationOption {
  id: string;
  title: string;
  type: "apartment" | "hotel" | "hostel" | "apart-hotel";
  pricePerNightRub: number;
  rating: number;
  distanceToCenterKm: number;
  source: string;
}

export interface FoodPlace {
  id: string;
  title: string;
  cuisine: string;
  priceLevel: "free" | "low" | "medium" | "high";
  averageBillRub: number;
  area: string;
  tags: string[];
}

export interface Attraction {
  id: string;
  title: string;
  category:
    | "park"
    | "museum"
    | "route"
    | "viewpoint"
    | "nature"
    | "event"
    | "photo"
    | "home";
  isFree: boolean;
  description: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export interface TripOption {
  id: string;
  title: string;
  destination: string;
  region: string;
  description: string;
  distanceKm: number;
  restMode: RestMode;
  timeBudgets: TimeBudget[];
  styles: TravelStyle[];
  minPeople: number;
  maxPeople: number;
  roadMinutes: number;
  transportOptions: TransportOption[];
  accommodations: AccommodationOption[];
  foodPlaces: FoodPlace[];
  attractions: Attraction[];
  homeWeather: WeatherInfo;
  destinationWeather: WeatherInfo;
  baseActivityCostRub: number;
  isFreeFriendly: boolean;
  checklistIds: string[];
  whyFits: string[];
}

export interface SavedPlan {
  id: string;
  tripId: string;
  savedAt: string;
  params: TripSearchParams;
  checklist: Checklist[];
}
