export type BudgetLevel = "€" | "€€" | "€€€" | null;

export type JourneyActivity = {
  timeOfDay: "morning" | "afternoon" | "evening";
  type: string;
  name: string;
  description: string;
  why: string;
  duration: string | null;
  price: BudgetLevel;
  placeId: string | null;
  address: string | null;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
};

export type JourneyDay = {
  day: number;
  title: string;
  activities: JourneyActivity[];
};

export type JourneyPlace = {
  name: string;
  placeId: string | null;
  rating: number | null;
  address: string | null;
  price: BudgetLevel;
};

export type JourneyPlan = {
  title: string;
  destination: string;
  summary: string;
  numberOfDays: number;
  dates: {
    start: string | null;
    end: string | null;
  };
  filters: string[];
  budget: BudgetLevel;
  tags: string[];
  googleQueries: {
    restaurants: string[];
    activities: string[];
    hotels: string[];
    events: string[];
  };
  whereToEat: JourneyPlace[];
  whereToSleep: JourneyPlace[];
  events: JourneyPlace[];
  points: JourneyPlace[];
  days: JourneyDay[];
  packingList: string[];
  localTips: string[];
  transportAdvice: string[];
  safetyOrWeatherNotes: string[] | null;
  confidence: number;
};
