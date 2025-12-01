import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { openai } from "../analyze-post/deps.ts";

type Budget = "€" | "€€" | "€€€" | null;

type JourneyInput = {
  location: string;
  numberOfDays: number;
  startDate?: string | null;
  filters?: string[];
  budget?: Budget;
};

type JourneyActivity = {
  timeOfDay: "morning" | "afternoon" | "evening";
  type: string;
  name: string;
  description: string;
  why: string;
  duration: string | null;
  price: Budget;
  placeId: string | null;
  address: string | null;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
};

type JourneyDay = {
  day: number;
  title: string;
  activities: JourneyActivity[];
};

type JourneyPlace = {
  name: string;
  placeId: string | null;
  rating: number | null;
  address: string | null;
  price: Budget;
};

type JourneyPlan = {
  title: string;
  destination: string;
  summary: string;
  numberOfDays: number;
  dates: { start: string | null; end: string | null };
  filters: string[];
  budget: Budget;
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

const model = "gpt-4o-mini";

const systemPrompt = `
You are an AI travel planner for the ReelToDo app.
Always return ONE SINGLE journey object.
Output VALID JSON only. No extra text.

Rules:
- Organize by days; 3–6 activities per day.
- Use timeOfDay: morning/afternoon/evening.
- Do not invent coordinates or place IDs; set them to null.
- Use price aligned to budget (€, €€, €€€) or null.
- Always include: whereToEat (3–6), whereToSleep (2–4), events (2–6), points (2–6), packingList (5–15), localTips (5–10), transportAdvice (3–8), googleQueries, confidence.
- If unknown, use null or [].
`;

const userPrompt = (input: JourneyInput) => {
  const endDate =
    input.startDate && input.numberOfDays
      ? new Date(
          new Date(input.startDate).getTime() +
            (Math.max(1, Math.min(input.numberOfDays, 30)) - 1) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)
      : null;

  return `
Create one journey with this shape:
{
  "title": string,
  "destination": string,
  "summary": string,
  "numberOfDays": number,
  "dates": { "start": string | null, "end": string | null },
  "filters": string[],
  "budget": "€" | "€€" | "€€€" | null,
  "tags": string[],
  "googleQueries": { "restaurants": string[], "activities": string[], "hotels": string[], "events": string[] },
  "whereToEat": [{ "name": string, "placeId": null, "rating": null, "address": null, "price": "€"|"€€"|"€€€"|null }],
  "whereToSleep": [{ "name": string, "placeId": null, "rating": null, "address": null, "price": "€"|"€€"|"€€€"|null }],
  "events": [{ "name": string, "placeId": null, "rating": null, "address": null, "price": "€"|"€€"|"€€€"|null }],
  "points": [{ "name": string, "placeId": null, "rating": null, "address": null, "price": "€"|"€€"|"€€€"|null }],
  "days": [{
    "day": number,
    "title": string,
    "activities": [{
      "timeOfDay": "morning"|"afternoon"|"evening",
      "type": string,
      "name": string,
      "description": string,
      "why": string,
      "duration": string | null,
      "price": "€"|"€€"|"€€€"|null,
      "placeId": null,
      "address": string | null,
      "coordinates": { "lat": null, "lng": null }
    }]
  }],
  "packingList": string[],
  "localTips": string[],
  "transportAdvice": string[],
  "safetyOrWeatherNotes": string[] | null,
  "confidence": number
}

Input:
- destination: ${input.location}
- days: ${input.numberOfDays}
- startDate: ${input.startDate ?? "null"}
- endDate: ${endDate ?? "null"}
- filters: ${input.filters?.join(", ") || "none"}
- budget: ${input.budget ?? "null"}
`;
};

const parseJson = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const clampDays = (value: number) => Math.max(1, Math.min(value, 30));

type LatLng = { lat: number; lng: number };

type GooglePlace = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: LatLng };
  rating?: number;
  price_level?: number;
  types?: string[];
};

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

const geocodeLocation = async (query: string): Promise<LatLng | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  const params = new URLSearchParams({
    address: query,
    key: GOOGLE_MAPS_API_KEY,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  const first = json.results?.[0];
  if (!first) return null;
  return first.geometry.location;
};

const fetchPlaces = async (params: {
  query: string;
  location?: LatLng | null;
  type?: string;
  limit?: number;
}): Promise<GooglePlace[]> => {
  if (!GOOGLE_MAPS_API_KEY) return [];
  const searchParams = new URLSearchParams({
    query: params.query,
    key: GOOGLE_MAPS_API_KEY,
  });
  if (params.location) {
    searchParams.set("location", `${params.location.lat},${params.location.lng}`);
    searchParams.set("radius", "8000");
  }
  if (params.type) searchParams.set("type", params.type);
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json.results ?? []).slice(0, params.limit ?? 6);
};

const priceLevelToBudget = (price?: number): Budget => {
  if (price === undefined || price === null) return null;
  if (price <= 1) return "€";
  if (price === 2) return "€€";
  return "€€€";
};

const setPlaceOnActivity = (activity: JourneyActivity, place: GooglePlace) => {
  activity.placeId = place.place_id;
  activity.address = place.formatted_address;
  activity.coordinates = {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  };
  if (!activity.price) {
    activity.price = priceLevelToBudget(place.price_level);
  }
  // Prefer real place name to ground the step.
  activity.name = place.name;
};

const pickPlace = (list: GooglePlace[], used: Set<string>): GooglePlace | null => {
  for (const place of list) {
    if (used.has(place.place_id)) continue;
    used.add(place.place_id);
    return place;
  }
  return null;
};

const isFoodType = (type: string) =>
  /food|restaurant|dinner|lunch|cafe|coffee|brunch/i.test(type);
const isMuseumType = (type: string) => /museum|gallery|exhibit|art/i.test(type);
const isEventType = (type: string) => /event|concert|show|festival|night/i.test(type);
const isWalkType = (type: string) => /walk|stroll|explore|neighborhood/i.test(type);

const enrichJourneyWithPlaces = async (
  journey: JourneyPlan
): Promise<JourneyPlan> => {
  if (!GOOGLE_MAPS_API_KEY) return journey;
  const locationLatLng = await geocodeLocation(journey.destination || journey.title);

  const [restaurants, attractions, hotels, events] = await Promise.all([
    fetchPlaces({
      query: `best restaurants ${journey.destination}`,
      location: locationLatLng,
      type: "restaurant",
      limit: 12,
    }),
    fetchPlaces({
      query: `top sights and museums ${journey.destination}`,
      location: locationLatLng,
      type: "tourist_attraction",
      limit: 12,
    }),
    fetchPlaces({
      query: `hotels ${journey.destination}`,
      location: locationLatLng,
      type: "lodging",
      limit: 6,
    }),
    fetchPlaces({
      query: `events concerts exhibitions ${journey.destination}`,
      location: locationLatLng,
      limit: 6,
    }),
  ]);

  // Fill whereToEat / whereToSleep with real places where possible.
  journey.whereToEat = journey.whereToEat.map((item, idx) => {
    const place = restaurants[idx] ?? restaurants[0];
    if (!place) return item;
    return {
      ...item,
      name: place.name,
      placeId: place.place_id,
      rating: place.rating ?? null,
      address: place.formatted_address ?? null,
      price: priceLevelToBudget(place.price_level) ?? item.price,
    };
  });

  journey.whereToSleep = journey.whereToSleep.map((item, idx) => {
    const place = hotels[idx] ?? hotels[0];
    if (!place) return item;
    return {
      ...item,
      name: place.name,
      placeId: place.place_id,
      rating: place.rating ?? null,
      address: place.formatted_address ?? null,
      price: priceLevelToBudget(place.price_level) ?? item.price,
    };
  });

  // Events list: use events results, fallback to attractions if empty.
  journey.events = (events.length ? events : attractions)
    .slice(0, Math.max(2, Math.min(6, events.length || attractions.length)))
    .map((place) => ({
      name: place.name,
      placeId: place.place_id,
      rating: place.rating ?? null,
      address: place.formatted_address ?? null,
      price: priceLevelToBudget(place.price_level),
    }));

  // Points of interest list: use attractions.
  journey.points = attractions.slice(0, 6).map((place) => ({
    name: place.name,
    placeId: place.place_id,
    rating: place.rating ?? null,
    address: place.formatted_address ?? null,
    price: priceLevelToBudget(place.price_level),
  }));

  const used = new Set<string>();
  journey.days = journey.days.map((day) => {
    const updatedActivities = day.activities.map((act) => {
      const type = act.type.toLowerCase();
      let source: GooglePlace[] = [];
      if (isFoodType(type)) {
        source = restaurants;
      } else if (isMuseumType(type)) {
        source = attractions;
      } else if (isEventType(type)) {
        source = events.length ? events : attractions;
      } else if (isWalkType(type)) {
        source = attractions;
      } else {
        source = attractions.length ? attractions : restaurants;
      }

      const place = pickPlace(source, used);
      if (place) {
        setPlaceOnActivity(act, place);
      }
      return act;
    });

    return { ...day, activities: updatedActivities };
  });

  // Ensure googleQueries are present if missing.
  if (!journey.googleQueries) {
    journey.googleQueries = {
      restaurants: [`best restaurants ${journey.destination}`],
      activities: [`top attractions ${journey.destination}`, `walking tour ${journey.destination}`],
      hotels: [`hotels ${journey.destination}`],
      events: [`events in ${journey.destination}`],
    };
  }

  return journey;
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: JourneyInput;
  try {
    body = await req.json();
  } catch (err) {
    console.log("[journey-plan] invalid JSON", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const payload: JourneyInput = {
    location: (body.location ?? "Unknown").slice(0, 120),
    numberOfDays: clampDays(body.numberOfDays ?? 3),
    startDate: body.startDate ?? null,
    filters: Array.isArray(body.filters) ? body.filters.slice(0, 12) : [],
    budget: (body.budget as Budget) ?? null,
  };

  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt(payload) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJson<Record<string, unknown>>(raw);

    if (!parsed) {
      throw new Error("parse_failed");
    }

    const enriched = await enrichJourneyWithPlaces(parsed as JourneyPlan);

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("[journey-plan] error", error);
    return new Response(
      JSON.stringify({ error: "generation_failed", detail: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
