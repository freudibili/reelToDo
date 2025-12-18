import { mediaAnalyzerApiToken, mediaAnalyzerUrl } from "./deps.ts";
import { normalizeActivityUrl } from "./normalize.ts";

type MediaAnalyzerLocation = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
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
  country?: string | null;
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
  general_category?: string | null;
};

export type MediaAnalyzerResponse = {
  sourceUrl?: string | null;
  platform?: string | null;
  rawTitle?: string | null;
  rawDescription?: string | null;
  creator?: string | null;
  thumbnailUrl?: string | null;
  activity?: MediaAnalyzerActivity | null;
  content?: MediaAnalyzerActivity | null;
};

export type AnalyzerResult =
  | MediaAnalyzerResponse
  | { _errorReason: string }
  | null;

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
  locations?: MediaAnalyzerLocation[] | null;
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
    (l) =>
      cleanNumber(l?.latitude) !== null && cleanNumber(l?.longitude) !== null
  );
  if (withCoords) return withCoords;

  const withPlace =
    locations.find(
      (l) =>
        cleanString(l?.name) || cleanString(l?.address) || cleanString(l?.city)
    ) ?? null;
  if (withPlace) return withPlace;

  return locations[0] ?? null;
};

const cleanLocation = (loc: MediaAnalyzerLocation | null | undefined) => {
  if (!loc) return null;
  const cleaned: MediaAnalyzerLocation = {
    name: cleanString(loc.name ?? null),
    address: cleanString(loc.address ?? null),
    city: cleanString(loc.city ?? null),
    country: cleanString(loc.country ?? null),
    latitude: cleanNumber(loc.latitude ?? null),
    longitude: cleanNumber(loc.longitude ?? null),
  };
  const hasAny =
    cleaned.name ||
    cleaned.address ||
    cleaned.city ||
    cleaned.country ||
    cleaned.latitude !== null ||
    cleaned.longitude !== null;
  return hasAny ? cleaned : null;
};

const sanitizeLocations = (
  locations: MediaAnalyzerLocation[] | undefined | null
): MediaAnalyzerLocation[] | null => {
  if (!Array.isArray(locations)) return null;
  const cleaned = locations
    .map((loc) => cleanLocation(loc))
    .filter((loc): loc is MediaAnalyzerLocation => Boolean(loc));
  return cleaned.length > 0 ? cleaned : null;
};

const formatKeyInfo = (
  keyInfo?: MediaAnalyzerKeyInfo | null
): string | null => {
  if (!keyInfo) return null;
  const parts = [
    keyInfo.estimated_price
      ? `Estimated price: ${keyInfo.estimated_price}`
      : null,
    keyInfo.transport ? `Transport: ${keyInfo.transport}` : null,
    keyInfo.best_time ? `Best time: ${keyInfo.best_time}` : null,
    keyInfo.duration ? `Duration: ${keyInfo.duration}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Key info: ${parts.join("; ")}` : null;
};

export const fetchMediaAnalyzer = async (
  url: string,
  options?: {
    platform?: string | null;
    extraSharedData?: Record<string, any> | null;
  }
): Promise<AnalyzerResult> => {
  if (!mediaAnalyzerUrl) return { _errorReason: "UNSUPPORTED_URL" };

  const timeoutMs = 60000;

  try {
    const res = await fetch(mediaAnalyzerUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(mediaAnalyzerApiToken
          ? { "x-api-key": mediaAnalyzerApiToken }
          : {}),
      },
      body: JSON.stringify({
        url,
        platform: options?.platform ?? null,
        extraSharedData: options?.extraSharedData ?? null,
      }),
      signal:
        typeof AbortSignal !== "undefined" &&
        typeof (AbortSignal as any).timeout === "function"
          ? (AbortSignal as any).timeout(timeoutMs)
          : undefined,
    });

    if (!res.ok) {
      console.log("[mediaanalyzer] upstream error", res.status);
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        return { _errorReason: "LOGIN_REQUIRED_OR_RATE_LIMIT" };
      }
      return { _errorReason: "DOWNLOAD_FAILED" };
    }

    const json = (await res.json()) as MediaAnalyzerResponse;
    console.log("[mediaanalyzer] full response object", json);
    const activity = json.activity ?? json.content ?? null;
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
    return { _errorReason: "DOWNLOAD_FAILED" };
  }
};

export const mapMediaAnalyzer = async (
  payload: AnalyzerResult,
  url: string,
  hints?: {
    title?: string;
    text?: string;
    creator?: string;
    locationHint?: string;
    cityHint?: string;
    coordinates?: { latitude?: number; longitude?: number };
    tags?: string[];
  }
): Promise<{
  activity: AnalyzerMappedActivity | null;
  description: string | null;
}> => {
  // If payload contains an error reason, treat as no activity
  if (payload && (payload as any)._errorReason) {
    const descOnly = (hints?.text ?? null) as string | null;
    return { activity: null, description: descOnly };
  }
  const activity = payload?.activity ?? payload?.content ?? null;

  if (!activity) {
    const descOnly = cleanString(
      (payload as MediaAnalyzerResponse)?.rawDescription ?? hints?.text ?? null
    );
    return { activity: null, description: descOnly };
  }

  const loc = pickBestLocation(activity.locations);
  const sanitizedLocations = sanitizeLocations(activity.locations);
  const otherLocations = (activity.locations ?? []).filter((l) => l !== loc);
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
    formatKeyInfo(activity.key_info),
    otherLocationsSummary,
  ].filter(Boolean);

  const normalizedSource = normalizeActivityUrl(
    activity.source_url ?? payload?.sourceUrl ?? url
  );

  const mapped: AnalyzerMappedActivity = {
    title:
      cleanString(activity.title) ??
      cleanString((payload as MediaAnalyzerResponse).rawTitle ?? null) ??
      cleanString(hints?.title ?? null) ??
      null,
    category: cleanString(
      activity.general_category ?? activity.category ?? null
    ),
    location_name:
      cleanString(activity.location_name ?? null) ??
      cleanString(loc?.name ?? null),
    address:
      cleanString(activity.address ?? null) ??
      cleanString(loc?.address ?? null) ??
      cleanString(loc?.name ?? null),
    city:
      cleanString(activity.city ?? null) ??
      cleanString(loc?.city ?? null) ??
      cleanString(hints?.cityHint ?? null),
    country:
      cleanString(activity.country ?? null) ??
      cleanString(loc?.country ?? null),
    latitude:
      cleanNumber(activity.latitude ?? null) ??
      cleanNumber(loc?.latitude ?? null),
    longitude:
      cleanNumber(activity.longitude ?? null) ??
      cleanNumber(loc?.longitude ?? null),
    date:
      Array.isArray(activity.dates) && activity.dates.length > 0
        ? cleanString(activity.dates[0])
        : null,
    dates: Array.isArray(activity.dates)
      ? activity.dates
          .map((d) => cleanString(d))
          .filter((d): d is string => Boolean(d))
      : undefined,
    locations: sanitizedLocations,
    tags: Array.from(
      new Set([
        ...safeTags(activity.tags ?? []),
        ...(Array.isArray(hints?.tags)
          ? hints!.tags.map((t) => String(t).trim()).filter(Boolean)
          : []),
      ])
    ),
    creator:
      cleanString(activity.creator ?? null) ??
      cleanString((payload as MediaAnalyzerResponse).creator ?? null) ??
      cleanString(hints?.creator ?? null),
    source_url: normalizedSource,
    image_url:
      cleanString(activity.thumbnailUrl ?? null) ??
      cleanString((payload as MediaAnalyzerResponse).thumbnailUrl ?? null) ??
      (isDataUrl(activity.thumbnailBase64 ?? null)
        ? null
        : cleanString(activity.thumbnailBase64 ?? null)),
    confidence:
      typeof activity.confidence === "number" ? activity.confidence : null,
  };

  // If coordinates were not provided by analyzer, apply hints.coordinates
  if (
    (mapped.latitude === null || mapped.longitude === null) &&
    hints?.coordinates
  ) {
    const lat = hints.coordinates.latitude;
    const lon = hints.coordinates.longitude;
    if (
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      typeof lon === "number" &&
      Number.isFinite(lon)
    ) {
      mapped.latitude = lat;
      mapped.longitude = lon;
    }
  }

  // If location name missing, use locationHint
  if (!mapped.location_name && hints?.locationHint)
    mapped.location_name = String(hints.locationHint).trim() || null;

  return {
    activity: mapped,
    description:
      descriptionParts.length > 0 ? descriptionParts.join("\n\n") : null,
  };
};
