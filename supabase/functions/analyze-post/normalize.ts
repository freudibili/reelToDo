export type AllowedCategory =
  | "outdoor-hike"
  | "outdoor-nature-spot"
  | "outdoor-beach"
  | "outdoor-park"
  | "outdoor-viewpoint"
  | "food-cafe"
  | "food-restaurant"
  | "food-bar"
  | "food-street-food"
  | "event-market"
  | "event-festival"
  | "event-concert"
  | "event-exhibition"
  | "culture-museum"
  | "culture-monument"
  | "culture-street-art"
  | "workshop-art"
  | "workshop-cooking"
  | "workshop-wellness"
  | "nightlife-club"
  | "nightlife-bar"
  | "shopping-local"
  | "shopping-vintage"
  | "other";

export const ALLOWED_CATEGORIES: AllowedCategory[] = [
  "outdoor-hike",
  "outdoor-nature-spot",
  "outdoor-beach",
  "outdoor-park",
  "outdoor-viewpoint",
  "food-cafe",
  "food-restaurant",
  "food-bar",
  "food-street-food",
  "event-market",
  "event-festival",
  "event-concert",
  "event-exhibition",
  "culture-museum",
  "culture-monument",
  "culture-street-art",
  "workshop-art",
  "workshop-cooking",
  "workshop-wellness",
  "nightlife-club",
  "nightlife-bar",
  "shopping-local",
  "shopping-vintage",
  "other",
];

const normalizeText = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/[#@]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "");

export const normalizeCategory = (
  raw: string | null | undefined
): AllowedCategory | null => {
  if (!raw) return null;
  const v = normalizeText(raw);
  if (ALLOWED_CATEGORIES.includes(v as AllowedCategory)) {
    return v as AllowedCategory;
  }

  const map: Record<string, AllowedCategory> = {
    hike: "outdoor-hike",
    hiking: "outdoor-hike",
    trek: "outdoor-hike",
    trail: "outdoor-hike",
    randonnée: "outdoor-hike",
    rando: "outdoor-hike",
    mountain: "outdoor-hike",
    mountains: "outdoor-hike",
    dolomites: "outdoor-hike",
    nature: "outdoor-nature-spot",
    waterfall: "outdoor-nature-spot",
    cascade: "outdoor-nature-spot",
    forest: "outdoor-nature-spot",
    parc: "outdoor-park",
    park: "outdoor-park",
    plage: "outdoor-beach",
    beach: "outdoor-beach",
    lake: "outdoor-nature-spot",
    viewpoint: "outdoor-viewpoint",
    view: "outdoor-viewpoint",
    café: "food-cafe",
    cafe: "food-cafe",
    coffee: "food-cafe",
    restaurant: "food-restaurant",
    resto: "food-restaurant",
    bar: "food-bar",
    pub: "food-bar",
    cocktail: "food-bar",
    streetfood: "food-street-food",
    foodtruck: "food-street-food",
    marché: "event-market",
    market: "event-market",
    festival: "event-festival",
    concert: "event-concert",
    gig: "event-concert",
    expo: "event-exhibition",
    exhibition: "event-exhibition",
    art: "culture-street-art",
    musée: "culture-museum",
    museum: "culture-museum",
    monument: "culture-monument",
    landmark: "culture-monument",
    mural: "culture-street-art",
    graffiti: "culture-street-art",
    peinture: "workshop-art",
    painting: "workshop-art",
    poterie: "workshop-art",
    pottery: "workshop-art",
    atelier: "workshop-art",
    cooking: "workshop-cooking",
    cuisine: "workshop-cooking",
    yoga: "workshop-wellness",
    meditation: "workshop-wellness",
    spa: "workshop-wellness",
    massage: "workshop-wellness",
    night: "nightlife-club",
    club: "nightlife-club",
    nightlife: "nightlife-club",
    dance: "nightlife-club",
    vintage: "shopping-vintage",
    friperie: "shopping-vintage",
    local: "shopping-local",
    shop: "shopping-local",
    boutique: "shopping-local",
  };

  return map[v] ?? null;
};

export const inferCategoryFromContent = (opts: {
  title?: string | null;
  description?: string | null;
  location_name?: string | null;
  tags?: string[] | null;
}): AllowedCategory | null => {
  const haystack = [
    opts.title ?? "",
    opts.description ?? "",
    opts.location_name ?? "",
    ...(opts.tags ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[#@]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "");

  if (
    haystack.match(
      /\b(hike|hiking|rando|randonnée|trail|trek|mountain|mountains|dolomites)\b/
    )
  )
    return "outdoor-hike";

  if (haystack.match(/\b(beach|plage|lake|forest|nature|waterfall|cascade)\b/))
    return "outdoor-nature-spot";

  if (haystack.match(/\b(park|parc)\b/)) return "outdoor-park";
  if (haystack.match(/\b(viewpoint|view|panorama)\b/))
    return "outdoor-viewpoint";
  if (haystack.match(/\b(café|cafe|coffee)\b/)) return "food-cafe";
  if (haystack.match(/\b(restaurant|resto)\b/)) return "food-restaurant";
  if (haystack.match(/\b(bar|pub|cocktail)\b/)) return "food-bar";
  if (haystack.match(/\b(streetfood|foodtruck)\b/)) return "food-street-food";
  if (haystack.match(/\b(marché|market)\b/)) return "event-market";
  if (haystack.match(/\b(festival)\b/)) return "event-festival";
  if (haystack.match(/\b(concert|gig)\b/)) return "event-concert";
  if (haystack.match(/\b(expo|exhibition)\b/)) return "event-exhibition";
  if (haystack.match(/\b(musée|museum)\b/)) return "culture-museum";
  if (haystack.match(/\b(monument|landmark)\b/)) return "culture-monument";
  if (haystack.match(/\b(street art|graffiti|mural)\b/))
    return "culture-street-art";
  if (haystack.match(/\b(painting|poterie|pottery|atelier|art)\b/))
    return "workshop-art";
  if (haystack.match(/\b(cooking|cuisine)\b/)) return "workshop-cooking";
  if (haystack.match(/\b(yoga|meditation|spa|massage)\b/))
    return "workshop-wellness";
  if (haystack.match(/\b(club|nightlife|dance)\b/)) return "nightlife-club";
  if (haystack.match(/\b(vintage|friperie)\b/)) return "shopping-vintage";
  if (haystack.match(/\b(shop|boutique|local)\b/)) return "shopping-local";

  return "other";
};

export const mergeIfNull = <T extends Record<string, any>>(
  primary: T,
  secondary: Partial<T>
): T => {
  const result: Record<string, any> = { ...primary };
  for (const key of Object.keys(secondary)) {
    const current = result[key];
    if (current === null || current === undefined || current === "") {
      result[key] = secondary[key];
    }
  }
  return result as T;
};

export const normalizeActivity = (activity: any) => {
  const singleDate = activity.date ?? null;
  const dates =
    Array.isArray(activity.dates) && activity.dates.length > 0
      ? activity.dates
      : singleDate
        ? [{ start: singleDate, end: null, recurrence_rule: null }]
        : [];
  return {
    title: activity.title ?? null,
    category: activity.category ?? null,
    location_name: activity.location_name ?? null,
    address: activity.address ?? null,
    city: activity.city ?? null,
    latitude: activity.latitude ?? null,
    longitude: activity.longitude ?? null,
    dates,
    tags: Array.isArray(activity.tags) ? activity.tags : [],
    creator: activity.creator ?? null,
    image_url: activity.image_url ?? null,
    confidence:
      typeof activity.confidence === "number" ? activity.confidence : 0.9,
    source_url: activity.source_url ?? null,
  };
};

export const generateTitle = (
  category: string,
  baseName: string,
  city: string | null
): string => {
  const cleanBase = baseName.replace(/^#/, "").trim();
  const suffix = city ? ` — ${city}` : "";
  switch (category) {
    case "outdoor-hike":
      return `Hike: ${cleanBase}${suffix}`;
    case "outdoor-nature-spot":
      return `Nature: ${cleanBase}${suffix}`;
    case "outdoor-beach":
      return `Beach: ${cleanBase}${suffix}`;
    case "outdoor-park":
      return `Park: ${cleanBase}${suffix}`;
    case "outdoor-viewpoint":
      return `Viewpoint: ${cleanBase}${suffix}`;
    case "food-cafe":
      return `Café: ${cleanBase}${suffix}`;
    case "food-restaurant":
      return `Restaurant: ${cleanBase}${suffix}`;
    case "food-bar":
      return `Bar: ${cleanBase}${suffix}`;
    case "food-street-food":
      return `Street food: ${cleanBase}${suffix}`;
    case "event-market":
      return `Market: ${cleanBase}${suffix}`;
    case "event-festival":
      return `Festival: ${cleanBase}${suffix}`;
    case "event-concert":
      return `Concert: ${cleanBase}${suffix}`;
    case "event-exhibition":
      return `Exhibition: ${cleanBase}${suffix}`;
    case "culture-museum":
      return `Museum: ${cleanBase}${suffix}`;
    case "culture-monument":
      return `Monument: ${cleanBase}${suffix}`;
    case "culture-street-art":
      return `Street art: ${cleanBase}${suffix}`;
    case "workshop-art":
      return `Art workshop: ${cleanBase}${suffix}`;
    case "workshop-cooking":
      return `Cooking workshop: ${cleanBase}${suffix}`;
    case "workshop-wellness":
      return `Wellness: ${cleanBase}${suffix}`;
    case "nightlife-club":
      return `Night out: ${cleanBase}${suffix}`;
    case "nightlife-bar":
      return `Night bar: ${cleanBase}${suffix}`;
    case "shopping-local":
      return `Shop: ${cleanBase}${suffix}`;
    case "shopping-vintage":
      return `Vintage shop: ${cleanBase}${suffix}`;
    default:
      return `${cleanBase}${suffix}`;
  }
};
