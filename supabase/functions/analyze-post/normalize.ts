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
  | "culture-architecture"
  | "workshop-cooking"
  | "workshop-art"
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
  "culture-architecture",
  "workshop-cooking",
  "workshop-art",
  "workshop-wellness",
  "nightlife-club",
  "nightlife-bar",
  "shopping-local",
  "shopping-vintage",
  "other",
];

export const normalizeCategory = (value: string | null): string | null => {
  if (!value) return null;
  const low = value.toLowerCase();

  if (low.includes("hike") || low.includes("trail")) return "outdoor-hike";
  if (low.includes("view") || low.includes("viewpoint"))
    return "outdoor-viewpoint";
  if (low.includes("beach")) return "outdoor-beach";
  if (low.includes("park")) return "outdoor-park";
  if (low.includes("nature") || low.includes("outdoor") || low.includes("travel"))
    return "outdoor-nature-spot";
  if (low.includes("sunrise")) return "outdoor-nature-spot";

  if (low.includes("cafe") || low.includes("coffee")) return "food-cafe";
  if (low.includes("restaurant") || low.includes("food"))
    return "food-restaurant";
  if (low.includes("bar")) return "food-bar";
  if (low.includes("street food")) return "food-street-food";

  if (low.includes("market")) return "event-market";
  if (low.includes("festival")) return "event-festival";
  if (low.includes("concert")) return "event-concert";
  if (low.includes("exhibition")) return "event-exhibition";

  if (low.includes("museum")) return "culture-museum";
  if (low.includes("monument")) return "culture-monument";
  if (low.includes("architecture")) return "culture-architecture";

  if (low.includes("workshop") && low.includes("cook"))
    return "workshop-cooking";
  if (low.includes("workshop") && low.includes("art")) return "workshop-art";
  if (low.includes("workshop") && low.includes("wellness"))
    return "workshop-wellness";

  if (low.includes("club")) return "nightlife-club";
  if (low.includes("nightlife") || low.includes("night bar"))
    return "nightlife-bar";

  if (low.includes("vintage")) return "shopping-vintage";
  if (low.includes("shop") || low.includes("local")) return "shopping-local";

  return "other";
};

export const inferCategoryFromContent = (input: {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  location_name?: string | null;
}): string | null => {
  const hay = [
    input.title ?? "",
    input.description ?? "",
    ...(input.tags ?? []),
    input.location_name ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (hay.match(/\b(hike|trail|randonn[eé]e|wanderung)\b/))
    return "outdoor-hike";
  if (hay.match(/\b(view|viewpoint|panorama|belvedere)\b/))
    return "outdoor-viewpoint";
  if (hay.match(/\b(beach|plage|strand)\b/)) return "outdoor-beach";
  if (hay.match(/\b(park|parc)\b/)) return "outdoor-park";
  if (
    hay.match(/\b(nature|forest|forêt|wald)\b/) ||
    hay.match(/\b(outdoor|travel|sunrise)\b/)
  )
    return "outdoor-nature-spot";

  if (hay.match(/\b(cafe|coffee|café)\b/)) return "food-cafe";
  if (hay.match(/\b(restaurant|food|lunch|dinner)\b/)) return "food-restaurant";
  if (hay.match(/\b(bar|cocktail)\b/)) return "food-bar";

  if (hay.match(/\b(market|march[eé]|markt)\b/)) return "event-market";
  if (hay.match(/\b(festival|fest)\b/)) return "event-festival";
  if (hay.match(/\b(concert|live music)\b/)) return "event-concert";
  if (hay.match(/\b(exhibition|expo)\b/)) return "event-exhibition";

  if (hay.match(/\b(museum|mus[eé]e)\b/)) return "culture-museum";
  if (hay.match(/\b(monument|castle|château|burg)\b/))
    return "culture-monument";

  if (hay.match(/\b(workshop|cours|ateliers)\b/)) return "workshop-art";

  return null;
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
  const normalizeDates = (): { start: string; end: string | null; recurrence_rule: any }[] => {
    const singleDate = activity.date ?? null;

    const fromArray = Array.isArray(activity.dates) ? activity.dates : [];
    const mappedArray = fromArray
      .map((d: any) => {
        if (!d) return null;
        if (typeof d === "string") return { start: d, end: null, recurrence_rule: null };
        if (typeof d === "object" && d.start) {
          return {
            start: d.start,
            end: d.end ?? null,
            recurrence_rule: d.recurrence_rule ?? null,
          };
        }
        return null;
      })
      .filter(
        (
          d: { start: string; end: string | null; recurrence_rule: any } | null
        ): d is { start: string; end: string | null; recurrence_rule: any } => Boolean(d)
      );

    if (mappedArray.length > 0) return mappedArray;
    if (singleDate) return [{ start: singleDate, end: null, recurrence_rule: null }];
    return [];
  };

  const dates = normalizeDates();
  return {
    title: activity.title ?? null,
    category: activity.category ?? null,
    location_name: activity.location_name ?? null,
    address: activity.address ?? null,
    city: activity.city ?? null,
    country: activity.country ?? null,
    latitude: activity.latitude ?? null,
    longitude: activity.longitude ?? null,
    dates,
    tags: Array.isArray(activity.tags) ? activity.tags : [],
    creator: activity.creator ?? null,
    image_url: activity.image_url ?? null,
    confidence:
      typeof activity.confidence === "number" ? activity.confidence : 0.9,
    source_url: activity.source_url
      ? normalizeActivityUrl(activity.source_url)
      : null,
  };
};

export const generateTitle = (
  category: string,
  baseName: string,
  city: string | null
): string => {
  const cleanBase = baseName.replace(/^#/, "").trim();
  const suffix = city ? ` (${city})` : "";

  switch (category) {
    case "outdoor-hike":
      return `Hike: ${cleanBase}${suffix}`;
    case "outdoor-nature-spot":
      return `Nature spot: ${cleanBase}${suffix}`;
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
    case "culture-architecture":
      return `Place: ${cleanBase}${suffix}`;
    case "workshop-cooking":
      return `Cooking workshop: ${cleanBase}${suffix}`;
    case "workshop-art":
      return `Art workshop: ${cleanBase}${suffix}`;
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

export const categoriesRequiringDate = new Set([
  "event-market",
  "event-festival",
  "event-concert",
  "event-exhibition",
  "workshop-cooking",
  "workshop-art",
  "workshop-wellness",
]);

export const normalizeActivityUrl = (input: string): string => {
  const trimmed = (input || "").trim();
  if (!trimmed) return trimmed;

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    if (!/^https?:\/\//i.test(trimmed)) {
      try {
        url = new URL(`https://${trimmed}`);
      } catch {
        return trimmed;
      }
    } else {
      return trimmed;
    }
  }

  let hostname = url.hostname.toLowerCase();
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  if (hostname === "youtu.be" || hostname.endsWith("youtube.com")) {
    return normalizeYouTubeUrl(url);
  }

  if (hostname.endsWith("instagram.com")) {
    return normalizeInstagramUrl(url);
  }

  if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) {
    return normalizeTikTokUrl(url);
  }

  if (
    hostname === "facebook.com" ||
    hostname.endsWith(".facebook.com") ||
    hostname === "fb.watch" ||
    hostname === "fb.com" ||
    hostname.endsWith(".fb.com") ||
    hostname === "fb.me"
  ) {
    return normalizeFacebookUrl(url);
  }

  return `${url.protocol}//${hostname}${url.pathname}`;
};

const normalizeYouTubeUrl = (url: URL): string => {
  const hostname = url.hostname.toLowerCase();
  const path = url.pathname;
  const params = url.searchParams;

  let videoId: string | null = null;

  if (path.startsWith("/shorts/")) {
    const parts = path.split("/");
    videoId = parts[2] || null;
  } else if (path === "/watch" && params.get("v")) {
    videoId = params.get("v");
  } else if (hostname === "youtu.be") {
    const parts = path.split("/").filter(Boolean);
    videoId = parts[0] || null;
  }

  if (videoId) {
    return `https://youtube.com/shorts/${videoId}`;
  }

  return `https://youtube.com${path}`;
};

const normalizeInstagramUrl = (url: URL): string => {
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const type = segments[0];
    const id = segments[1];
    if (["reel", "p", "tv"].includes(type)) {
      return `https://www.instagram.com/${type}/${id}`;
    }
  }
  const path = url.pathname.replace(/\/$/, "");
  return `https://www.instagram.com${path}`;
};

const normalizeTikTokUrl = (url: URL): string => {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "vm.tiktok.com") {
    return `https://vm.tiktok.com${url.pathname}`;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const atUserIndex = segments.findIndex((s) => s.startsWith("@"));

  if (
    atUserIndex !== -1 &&
    segments[atUserIndex + 1] === "video" &&
    segments[atUserIndex + 2]
  ) {
    const user = segments[atUserIndex];
    const videoId = segments[atUserIndex + 2];
    return `https://www.tiktok.com/${user}/video/${videoId}`;
  }

  return `https://www.tiktok.com${url.pathname}`;
};

const normalizeFacebookUrl = (url: URL): string => {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "fb.watch") {
    return `https://fb.watch${url.pathname}`;
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] === "reel" && segments[1]) {
    return `https://www.facebook.com/reel/${segments[1]}`;
  }

  if (segments[0] === "watch" || url.pathname === "/watch") {
    const v = url.searchParams.get("v");
    if (v) return `https://www.facebook.com/watch/?v=${v}`;
  }

  if (segments[0] === "story.php" || url.pathname === "/story.php") {
    const storyId = url.searchParams.get("story_fbid");
    if (storyId) {
      return `https://www.facebook.com/story.php?story_fbid=${storyId}`;
    }
  }

  const path = url.pathname.replace(/\/$/, "");
  return `https://www.facebook.com${path}`;
};
