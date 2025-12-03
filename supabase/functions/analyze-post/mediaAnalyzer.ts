import { mediaAnalyzerApiToken, mediaAnalyzerUrl } from "./deps.ts";
import { normalizeActivityUrl } from "./normalize.ts";

type MediaAnalyzerLocation = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type MediaAnalyzerKeyInfo = {
  estimated_price?: string | null;
  transport?: string | null;
  best_time?: string | null;
  duration?: string | null;
};

type MediaAnalyzerActivity = {
  title?: string | null;
  category?: string | null;
  location_name?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  dates?: string[]; // upstream now returns an array of dates
  tags?: string[];
  creator?: string | null;
  source_url?: string | null;
  confidence?: number | null;
  locations?: MediaAnalyzerLocation[];
  key_info?: MediaAnalyzerKeyInfo;
  thumbnailBase64?: string | null;
  thumbnailUrl?: string | null;
};

export type MediaAnalyzerResponse = {
  sourceUrl?: string | null;
  platform?: string | null;
  rawTitle?: string | null;
  rawDescription?: string | null;
  creator?: string | null;
  thumbnailUrl?: string | null;
  activity?: MediaAnalyzerActivity | null;
};

export type AnalyzerMappedActivity = {
  title: string | null;
  category: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  dates?: string[];
  tags: string[];
  creator: string | null;
  source_url: string | null;
  image_url: string | null;
  confidence: number | null;
};

const cleanString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const cleanCategory = (value: unknown): string | null => {
  const v = cleanString(value);
  if (!v) return null;
  const low = v.toLowerCase();
  if (["unknown", "uncategorized", "other"].includes(low)) return null;
  return v;
};

const cleanNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};

const isDataUrl = (value: string | null): boolean => {
  return !!value && value.startsWith("data:");
};

const safeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : String(v ?? "")))
    .filter((v) => v.length > 0);
};

const pickBestLocation = (
  locations: MediaAnalyzerLocation[] | undefined
): MediaAnalyzerLocation | null => {
  if (!Array.isArray(locations) || locations.length === 0) return null;

  const withCoords = locations.find(
    (l) => cleanNumber(l?.latitude) !== null && cleanNumber(l?.longitude) !== null
  );
  if (withCoords) return withCoords;

  const withPlace =
    locations.find(
      (l) => cleanString(l?.name) || cleanString(l?.address) || cleanString(l?.city)
    ) ?? null;
  if (withPlace) return withPlace;

  return locations[0] ?? null;
};

const formatKeyInfo = (keyInfo?: MediaAnalyzerKeyInfo | null): string | null => {
  if (!keyInfo) return null;
  const parts = [
    keyInfo.estimated_price ? `Estimated price: ${keyInfo.estimated_price}` : null,
    keyInfo.transport ? `Transport: ${keyInfo.transport}` : null,
    keyInfo.best_time ? `Best time: ${keyInfo.best_time}` : null,
    keyInfo.duration ? `Duration: ${keyInfo.duration}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Key info: ${parts.join("; ")}` : null;
};

export const fetchMediaAnalyzer = async (
  url: string
): Promise<MediaAnalyzerResponse | null> => {
  if (!mediaAnalyzerUrl) return null;

  try {
    const res = await fetch(mediaAnalyzerUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(mediaAnalyzerApiToken ? { "x-api-key": mediaAnalyzerApiToken } : {}),
      },
      body: JSON.stringify({ url }),
      signal:
        typeof AbortSignal !== "undefined" &&
        typeof (AbortSignal as any).timeout === "function"
          ? (AbortSignal as any).timeout(8000)
          : undefined,
    });

    if (!res.ok) {
      console.log("[mediaanalyzer] upstream error", res.status);
      return null;
    }

    const json = (await res.json()) as MediaAnalyzerResponse;
    const activity = json.activity ?? null;
    console.log("[mediaanalyzer] raw response", {
      platform: json.platform ?? null,
      rawTitle: json.rawTitle ?? null,
      rawDescription: json.rawDescription ?? null,
      creator: json.creator ?? null,
      activity: activity
        ? {
            category: activity.category ?? null,
            title: activity.title ?? null,
            locations: activity.locations ?? null,
            dates: activity.dates ?? null,
            key_info: activity.key_info ?? null,
            tags: activity.tags ?? null,
            creator: activity.creator ?? null,
            source_url: activity.source_url ?? null,
            thumbnailUrl: activity.thumbnailUrl ?? null,
            confidence: activity.confidence ?? null,
          }
        : null,
    });
    return json;
  } catch (err) {
    console.log("[mediaanalyzer] request failed", String(err));
    return null;
  }
};

export const mapMediaAnalyzer = (
  payload: MediaAnalyzerResponse | null,
  url: string
): { activity: AnalyzerMappedActivity | null; description: string | null } => {
  if (!payload?.activity) {
    const descOnly = cleanString(payload?.rawDescription ?? null);
    return { activity: null, description: descOnly };
  }

  const loc = pickBestLocation(payload.activity.locations);
  const otherLocations = (payload.activity.locations ?? []).filter((l) => l !== loc);
  const otherLocationsSummary =
    otherLocations.length > 0
      ? `Other locations mentioned: ${otherLocations
          .map((l) =>
            [cleanString(l?.name ?? null), cleanString(l?.city ?? null)]
              .filter(Boolean)
              .join(" - ")
          )
          .filter(Boolean)
          .join(", ")}`
      : null;
  const descriptionParts = [
    cleanString(payload.rawDescription ?? null),
    formatKeyInfo(payload.activity.key_info),
    otherLocationsSummary,
  ].filter(Boolean);

  const normalizedSource = normalizeActivityUrl(
    payload.activity.source_url ?? payload.sourceUrl ?? url
  );

  const mapped: AnalyzerMappedActivity = {
    title:
      cleanString(payload.activity.title) ??
      cleanString(payload.rawTitle ?? null) ??
      null,
    category: cleanCategory(payload.activity.category ?? null),
    location_name:
      cleanString(payload.activity.location_name ?? null) ??
      cleanString(loc?.name ?? null),
    address: cleanString(payload.activity.address ?? null) ?? cleanString(loc?.address ?? null),
    city: cleanString(payload.activity.city ?? null) ?? cleanString(loc?.city ?? null),
    country: null,
    latitude:
      cleanNumber(payload.activity.latitude ?? null) ??
      cleanNumber(loc?.latitude ?? null),
    longitude:
      cleanNumber(payload.activity.longitude ?? null) ??
      cleanNumber(loc?.longitude ?? null),
    date:
      Array.isArray(payload.activity.dates) && payload.activity.dates.length > 0
        ? cleanString(payload.activity.dates[0])
        : null,
    dates: Array.isArray(payload.activity.dates)
      ? payload.activity.dates
          .map((d) => cleanString(d))
          .filter((d): d is string => Boolean(d))
      : undefined,
    tags: safeTags(payload.activity.tags ?? []),
    creator:
      cleanString(payload.activity.creator ?? null) ??
      cleanString(payload.creator ?? null),
    source_url: normalizedSource,
    image_url:
      cleanString(payload.activity.thumbnailUrl ?? null) ??
      cleanString(payload.thumbnailUrl ?? null) ??
      (isDataUrl(payload.activity.thumbnailBase64 ?? null)
        ? null
        : cleanString(payload.activity.thumbnailBase64 ?? null)),
    confidence:
      typeof payload.activity.confidence === "number"
        ? payload.activity.confidence
        : null,
  };

  return {
    activity: mapped,
    description: descriptionParts.length > 0 ? descriptionParts.join("\n\n") : null,
  };
};
