export const mergeIfNull = <T extends Record<string, any>>(
  primary: T,
  secondary: Partial<T>,
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
  const normalizeDates = (): {
    start: string;
    end: string | null;
    recurrence_rule: any;
  }[] => {
    const singleDate = activity.date ?? null;

    const fromArray = Array.isArray(activity.dates) ? activity.dates : [];
    const mappedArray = fromArray
      .map((d: any) => {
        if (!d) return null;
        if (typeof d === "string") {
          return { start: d, end: null, recurrence_rule: null };
        }
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
          d: { start: string; end: string | null; recurrence_rule: any } | null,
        ): d is { start: string; end: string | null; recurrence_rule: any } =>
          Boolean(d),
      );

    if (mappedArray.length > 0) return mappedArray;
    if (singleDate) {
      return [{ start: singleDate, end: null, recurrence_rule: null }];
    }
    return [];
  };

  const dates = normalizeDates();
  return {
    title: activity.title ?? null,
    category: typeof activity.category === "string"
      ? activity.category
      : null,
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
    confidence: typeof activity.confidence === "number"
      ? activity.confidence
      : 0.9,
    source_url: activity.source_url
      ? normalizeActivityUrl(activity.source_url)
      : null,
  };
};

export const categoriesRequiringDate = new Set<string>([
  "events_entertainment",
  "nightlife_social",
  "shopping_markets",
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
