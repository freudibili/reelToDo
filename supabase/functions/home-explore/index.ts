import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { openai } from "../analyze-post/deps.ts";

type BudgetLevel = "€" | "€€" | "€€€";
type CategoryTag =
  | "highlights"
  | "walks"
  | "hikes"
  | "museums"
  | "food"
  | "cafes"
  | "bars"
  | "markets"
  | "nightlife"
  | "family"
  | "design";

type LatLng = { lat: number; lng: number };

type Itinerary = {
  id: string;
  title: string;
  description: string;
  days: number;
  stops: string[];
  tags: CategoryTag[];
  mapsUrl?: string;
  mapImageUrl?: string;
  directions?: DirectionsSummary;
};

type EatSpot = {
  id: string;
  name: string;
  category: string;
  budget: BudgetLevel;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

type SleepSpot = {
  id: string;
  name: string;
  type: string;
  priceRange: string;
  description: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
  distance?: string;
};

type PackingItem = {
  id: string;
  label: string;
  detail: string;
  tags: CategoryTag[];
};

type EventSpot = {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

type PoiSpot = {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

type ExploreResponse = {
  location: string;
  itineraries: Itinerary[];
  eats: EatSpot[];
  sleeps: SleepSpot[];
  events: EventSpot[];
  points: PoiSpot[];
  packing: PackingItem[];
};

type ExploreInput = {
  location?: string;
  days?: number;
  categories?: CategoryTag[];
  budget?: BudgetLevel | number;
};

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("Missing GOOGLE_MAPS_API_KEY for home-explore");
}
const model = "gpt-4o-mini";

type GeocodeResult = {
  formatted: string;
  location: LatLng;
};

type GooglePlace = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: LatLng };
  types: string[];
  price_level?: number;
  photos?: { photo_reference: string }[];
  user_ratings_total?: number;
  rating?: number;
};

const formatBudget = (priceLevel?: number): BudgetLevel => {
  if (priceLevel === undefined || priceLevel === null) return "€€";
  if (priceLevel <= 1) return "€";
  if (priceLevel === 2) return "€€";
  return "€€€";
};

const formatDistance = (from: LatLng, to: LatLng) => {
  const R = 6371e3;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;

  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const mapsPlaceUrl = (placeId: string) =>
  `https://www.google.com/maps/place/?q=place_id:${placeId}`;

const mapsPhotoUrl = (photoRef: string) =>
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;

const geocodeLocation = async (query: string): Promise<GeocodeResult | null> => {
  const params = new URLSearchParams({
    address: query,
    key: GOOGLE_MAPS_API_KEY,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== "OK" || !json.results?.length) return null;
  const first = json.results[0];
  return {
    formatted: first.formatted_address,
    location: first.geometry.location,
  };
};

const fetchPlaces = async (params: {
  query: string;
  location: LatLng;
  type?: string;
  limit?: number;
}): Promise<GooglePlace[]> => {
  const limit = params.limit ?? 6;
  const searchParams = new URLSearchParams({
    query: params.query,
    key: GOOGLE_MAPS_API_KEY!,
    location: `${params.location.lat},${params.location.lng}`,
    radius: "6000",
  });
  if (params.type) searchParams.set("type", params.type);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`
  );
  if (!res.ok) return [];
  const json = await res.json();
  if (json.status !== "OK" || !json.results) return [];
  return json.results.slice(0, limit);
};

const buildMapDirectionsUrl = (stops: LatLng[]) => {
  if (stops.length === 0) return undefined;
  const origin = `${stops[0].lat},${stops[0].lng}`;
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
  const waypoints = stops.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const buildStaticMapUrl = (stops: LatLng[]) => {
  if (stops.length === 0) return undefined;
  const markers = stops
    .slice(0, 6)
    .map(
      (s, idx) =>
        `markers=color:${idx === 0 ? "green" : "red"}|label:${idx + 1}|${s.lat},${s.lng}`
    )
    .join("&");
  const params = [`size=800x400`, `maptype=roadmap`, markers, `key=${GOOGLE_MAPS_API_KEY}`]
    .filter(Boolean)
    .join("&");
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`;
};

const mapPlaceToEatSpot = (place: GooglePlace, origin: LatLng): EatSpot => {
  const distance = formatDistance(origin, place.geometry.location);
  const photoRef = place.photos?.[0]?.photo_reference;
  return {
    id: place.place_id,
    name: place.name,
    category: place.types?.[0] ?? "Food",
    budget: formatBudget(place.price_level),
    description: place.formatted_address,
    distance,
    tags: ["food"],
    photoUrl: photoRef ? mapsPhotoUrl(photoRef) : undefined,
    mapsUrl: mapsPlaceUrl(place.place_id),
  };
};

const mapPlaceToSleepSpot = (place: GooglePlace, origin: LatLng): SleepSpot => {
  const distance = formatDistance(origin, place.geometry.location);
  const photoRef = place.photos?.[0]?.photo_reference;
  return {
    id: place.place_id,
    name: place.name,
    type: "Stay",
    priceRange: `${formatBudget(place.price_level)} · lodging`,
    description: place.formatted_address,
    tags: ["design"],
    photoUrl: photoRef ? mapsPhotoUrl(photoRef) : undefined,
    mapsUrl: mapsPlaceUrl(place.place_id),
    distance,
  };
};

const mapPlaceToEvent = (place: GooglePlace, origin: LatLng): EventSpot => {
  const distance = formatDistance(origin, place.geometry.location);
  const photoRef = place.photos?.[0]?.photo_reference;
  return {
    id: place.place_id,
    name: place.name,
    category: "Event",
    description: place.formatted_address,
    distance,
    tags: ["nightlife", "design"],
    photoUrl: photoRef ? mapsPhotoUrl(photoRef) : undefined,
    mapsUrl: mapsPlaceUrl(place.place_id),
  };
};

const mapPlaceToPoi = (place: GooglePlace, origin: LatLng): PoiSpot => {
  const distance = formatDistance(origin, place.geometry.location);
  const photoRef = place.photos?.[0]?.photo_reference;
  return {
    id: place.place_id,
    name: place.name,
    category: place.types?.[0] ?? "Attraction",
    description: place.formatted_address,
    distance,
    tags: ["highlights", "walks"],
    photoUrl: photoRef ? mapsPhotoUrl(photoRef) : undefined,
    mapsUrl: mapsPlaceUrl(place.place_id),
  };
};

const buildItineraryFromPlaces = async (params: {
  locationName: string;
  origin: LatLng;
  attractions: GooglePlace[];
  eats: GooglePlace[];
  days: number;
}): Promise<Itinerary[]> => {
  if (params.attractions.length === 0) return [];
  const dayStops = [
    ...params.attractions.slice(0, 3),
    ...params.eats.slice(0, 1),
  ];
  const stopNames = dayStops.map((p) => `${p.name} — ${p.formatted_address}`);
  const mapStops = dayStops.map((p) => p.geometry.location);
  const directions = await fetchDirections(mapStops);
  return [
    {
      id: `day-plan-${params.locationName.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${params.locationName}: real-day plan`,
      description: "A short loop with verified places you can open in Google Maps.",
      days: Math.max(1, Math.min(params.days, 3)),
      stops: stopNames,
      tags: ["highlights", "walks"],
      mapsUrl: buildMapDirectionsUrl(mapStops),
      mapImageUrl: buildStaticMapUrl(mapStops),
      directions,
    },
  ];
};

const defaultPacking = (): PackingItem[] => [
  {
    id: "walking-shoes",
    label: "Comfortable walking shoes",
    detail: "Plan assumes short walks between stops.",
    tags: ["walks", "family"],
  },
  {
    id: "offline-maps",
    label: "Offline maps",
    detail: "Download the area in Google Maps before heading out.",
    tags: ["highlights"],
  },
  {
    id: "water",
    label: "Water bottle",
    detail: "Stay hydrated between museum and food stops.",
    tags: ["walks"],
  },
];

type AiItinerary = {
  id: string;
  title: string;
  description: string;
  days: number;
  stops: string[];
  tags: CategoryTag[];
};

type AiPayload = {
  location: string;
  days: number;
  budget: BudgetLevel;
  categories: CategoryTag[];
  restaurants: string[];
  attractions: string[];
  events: string[];
};

type AiResult = {
  location: string;
  itineraries: AiItinerary[];
  packing: PackingItem[];
};

const systemPrompt = `
You are a concise trip and activity planner.
Return a single JSON object with keys: location, itineraries, packing.
Respond in English and DO NOT add extra keys or text.

Rules:
- Only use place names provided in the user message for stops. Never invent new places or precise addresses.
- Distances are not required in the JSON.
- Itinerary stops must be short, bullet-like strings.
- Keep titles tight and inviting.
- If information is limited, keep arrays small (1-2 items) but non-empty.
- Respect category tags: only use tags from ["highlights","walks","hikes","museums","food","cafes","bars","markets","nightlife","family","design"].
`;

const userPrompt = (payload: AiPayload) => `
Plan ideas for a trip.
- location: ${payload.location}
- days: ${payload.days}
- budget cap: ${payload.budget}
- focus tags: ${payload.categories.length ? payload.categories.join(",") : "any"}

Places you can use (only these):
- Restaurants/bars: ${payload.restaurants.join(" ; ")}
- Museums/attractions: ${payload.attractions.join(" ; ")}
- Events: ${payload.events.join(" ; ")}

Output JSON with shape:
{
  "location": "<string>",
  "itineraries": [{ "id": "slug", "title": "", "description": "", "days": <number>, "stops": ["",""], "tags": ["highlights"] }],
  "packing": [{ "id": "slug", "label": "", "detail": "", "tags": ["walks"] }]
}`;

const toJson = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const buildAiSuggestions = async (params: AiPayload): Promise<AiResult | null> => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt(params) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = toJson<AiResult>(raw);
    return parsed;
  } catch (error) {
    console.log("[home-explore] ai error", error);
    return null;
  }
};

const safeSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plan";

const resolveItineraryMaps = async (
  itin: AiItinerary,
  places: GooglePlace[]
): Promise<Itinerary> => {
  const normalized = places.map((p) => ({
    key: p.name.toLowerCase(),
    place: p,
  }));

  const mapStops: LatLng[] = [];
  const stopText: string[] = [];

  for (const raw of itin.stops) {
    const name = raw.split("—")[0].trim().toLowerCase();
    const match = normalized.find((p) => name && name.startsWith(p.key)) ??
      normalized.find((p) => p.key.includes(name));
    if (match) {
      mapStops.push(match.place.geometry.location);
      stopText.push(`${match.place.name} — ${match.place.formatted_address}`);
    } else {
      stopText.push(raw);
    }
  }

  const mapsUrl = buildMapDirectionsUrl(mapStops);
  const mapImageUrl = buildStaticMapUrl(mapStops);

  const directions = await fetchDirections(mapStops);

  const itinerary: Itinerary = {
    id: itin.id || safeSlug(itin.title),
    title: itin.title,
    description: itin.description,
    days: itin.days,
    stops: stopText,
    tags: itin.tags,
    mapsUrl: mapsUrl ?? undefined,
    mapImageUrl: mapImageUrl ?? undefined,
    directions,
  };

  return itinerary;
};

const budgetToSymbol = (budget: BudgetLevel | number | undefined): BudgetLevel => {
  if (!budget) return "€€";
  if (typeof budget === "string") return budget as BudgetLevel;
  if (budget <= 1) return "€";
  if (budget === 2) return "€€";
  return "€€€";
};

type DirectionsSummary = {
  distanceText?: string;
  durationText?: string;
  url?: string;
};

const fetchDirections = async (stops: LatLng[]): Promise<DirectionsSummary> => {
  if (stops.length < 2) return {};
  const origin = `${stops[0].lat},${stops[0].lng}`;
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
  const waypoints = stops.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("|");

  const params = new URLSearchParams({
    origin,
    destination,
    key: GOOGLE_MAPS_API_KEY,
  });
  if (waypoints) params.set("waypoints", waypoints);

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    );
    if (!res.ok) return {};
    const json = await res.json();
    const route = json.routes?.[0];
    const leg = route?.legs?.[0];
    return {
      distanceText: leg?.distance?.text,
      durationText: leg?.duration?.text,
      url: route?.overview_polyline ? buildMapDirectionsUrl(stops) : undefined,
    };
  } catch (err) {
    console.log("[home-explore] directions error", err);
    return {};
  }
};

const handleRequest = async (input: ExploreInput): Promise<Response> => {
  const locationQuery = input.location?.trim() || "Near me";
  const days = Math.min(Math.max(input.days ?? 1, 1), 14);
  const budget = budgetToSymbol(input.budget);
  const categories = input.categories ?? [];

  const geocoded = await geocodeLocation(locationQuery);
  if (!geocoded) {
    return new Response(
      JSON.stringify({ error: "invalid_location", detail: "Could not locate that place." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [restaurants, museums, stays, eventsPlaces, poiPlaces] = await Promise.all([
      fetchPlaces({
        query: `best restaurants in ${geocoded.formatted}`,
        location: geocoded.location,
        type: "restaurant",
        limit: 6,
      }),
      fetchPlaces({
        query: `museums and attractions in ${geocoded.formatted}`,
        location: geocoded.location,
        type: "museum",
        limit: 6,
      }),
      fetchPlaces({
        query: `places to stay in ${geocoded.formatted}`,
        location: geocoded.location,
        type: "lodging",
        limit: 4,
      }),
      fetchPlaces({
        query: `events and concerts in ${geocoded.formatted}`,
        location: geocoded.location,
        limit: 5,
      }),
      fetchPlaces({
        query: `points of interest in ${geocoded.formatted}`,
        location: geocoded.location,
        type: "tourist_attraction",
        limit: 6,
      }),
    ]);

    const eats = restaurants.slice(0, 6).map((p) => mapPlaceToEatSpot(p, geocoded.location));
    const sleeps = stays.map((p) => mapPlaceToSleepSpot(p, geocoded.location));
    const events = eventsPlaces.map((p) => mapPlaceToEvent(p, geocoded.location));
    const points = poiPlaces.map((p) => mapPlaceToPoi(p, geocoded.location));

    const ai = await buildAiSuggestions({
      location: geocoded.formatted,
      days,
      budget,
      categories,
      restaurants: restaurants.map((r) => r.name),
      attractions: museums.map((m) => m.name),
      events: eventsPlaces.map((e) => e.name),
    });

    const aiItineraries =
      ai?.itineraries
        ? await Promise.all(
            ai.itineraries.map((it) => resolveItineraryMaps(it, [...museums, ...restaurants]))
          )
        : [];

    const fallbackItineraries = aiItineraries.length
      ? aiItineraries
      : await buildItineraryFromPlaces({
          locationName: geocoded.formatted,
          origin: geocoded.location,
          attractions: museums,
          eats: restaurants,
          days,
        });

    const packing = ai?.packing?.length ? ai.packing : defaultPacking();

    const response: ExploreResponse = {
      location: geocoded.formatted,
      itineraries: fallbackItineraries,
      eats,
      sleeps,
      events,
      points,
      packing,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("[home-explore] error", error);
    return new Response(
      JSON.stringify({ error: "fetch_failed", detail: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: ExploreInput = {};
  try {
    body = await req.json();
  } catch (err) {
    console.log("[home-explore] invalid JSON", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  return handleRequest(body);
});
