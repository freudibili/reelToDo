import i18next from "@common/i18n/i18n";

import type { Activity, MediaAnalyzerLocation } from "./types";

export const formatDisplayDate = (
  date: string | Date | null | undefined
): string | null => {
  if (!date) return null;

  const parsed = typeof date === "string" ? new Date(date) : date;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;

  try {
    const locale =
      i18next.resolvedLanguage === "fr" ? "fr-FR" : "en-US";
    return parsed.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return parsed.toDateString();
  }
};

export const formatDisplayDateTime = (
  value: string | Date | null | undefined
): string | null => {
  const date = formatDisplayDate(value);
  const time = formatDisplayTime(value);
  if (date && time) return `${date} · ${time}`;
  return date ?? time ?? null;
};

const normalizeLocation = (
  location: MediaAnalyzerLocation | null | undefined,
): MediaAnalyzerLocation => ({
  name: location?.name ?? null,
  address: location?.address ?? null,
  city: location?.city ?? null,
  country: location?.country ?? null,
  latitude:
    typeof location?.latitude === "number" ? location?.latitude : null,
  longitude:
    typeof location?.longitude === "number" ? location?.longitude : null,
});

const isLocationEmpty = (location: MediaAnalyzerLocation | null | undefined) =>
  !location ||
  (!location.name &&
    !location.address &&
    !location.city &&
    !location.country);

const getLocationKey = (location: MediaAnalyzerLocation) =>
  [
    location.name,
    location.address,
    location.city,
    location.country,
    location.latitude,
    location.longitude,
  ]
    .map((value) => (value === null ? "" : String(value)))
    .join("|");

export const getActivityLocations = (
  activity: Pick<
    Activity,
    | "location_name"
    | "address"
    | "city"
    | "country"
    | "latitude"
    | "longitude"
    | "locations"
    | "analyzer_locations"
  >,
): MediaAnalyzerLocation[] => {
  const sources: MediaAnalyzerLocation[] = [
    normalizeLocation({
      name: activity.location_name,
      address: activity.address,
      city: activity.city,
      country: activity.country,
      latitude: activity.latitude,
      longitude: activity.longitude,
    }),
    ...(Array.isArray(activity.analyzer_locations)
      ? activity.analyzer_locations
      : []),
    ...(Array.isArray(activity.locations) ? activity.locations : []),
  ]
    .map(normalizeLocation)
    .filter((loc) => !isLocationEmpty(loc));

  const seen = new Set<string>();
  const unique: MediaAnalyzerLocation[] = [];
  sources.forEach((loc) => {
    const key = getLocationKey(loc);
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(loc);
  });

  return unique;
};

export const formatLocationEntry = (
  location: MediaAnalyzerLocation | null | undefined,
  fallbackRegion?: string | null,
): string | null => {
  if (!location) return null;
  const main = location.name ?? location.address;
  const region = location.city ?? location.country ?? fallbackRegion;
  const label = [main, region].filter(Boolean).join(" • ");
  return label || null;
};

export const formatActivityLocation = (
  activity: Pick<
    Activity,
    | "location_name"
    | "city"
    | "country"
    | "address"
    | "locations"
    | "analyzer_locations"
    | "latitude"
    | "longitude"
  >
): string | null => {
  const locations = getActivityLocations(activity);
  const primaryLocation = locations.length > 0 ? locations[0] : null;
  const fallbackRegion = activity.city ?? activity.country ?? null;

  return (
    formatLocationEntry(primaryLocation, fallbackRegion) ??
    formatLocationEntry(
      {
        name: activity.location_name,
        address: activity.address,
        city: activity.city,
        country: activity.country,
        latitude: activity.latitude,
        longitude: activity.longitude,
      },
      fallbackRegion,
    )
  );
};

export const getPrimaryDateValue = (
  activity: Pick<Activity, "planned_at" | "dates" | "main_date">
): string | null =>
  activity.planned_at ?? getOfficialDateValue(activity);

export const getOfficialDateValue = (
  activity: Pick<Activity, "dates" | "main_date">
): string | null => {
  const dates = getActivityDateValues(activity);
  return dates.length > 0 ? dates[0] : null;
};

export const isSameDateValue = (
  a: string | Date | null | undefined,
  b: string | Date | null | undefined
): boolean => {
  const aDate = parseDateValue(a);
  const bDate = parseDateValue(b);
  if (!aDate || !bDate) return false;
  return aDate.getTime() === bDate.getTime();
};

export const parseDateValue = (
  value: string | Date | null | undefined
): Date | null => {
  if (!value) return null;
  let parsed: Date;
  if (typeof value === "string") {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    parsed = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  } else {
    parsed = value;
  }
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getActivityDateValues = (
  activity: Pick<Activity, "dates" | "main_date">,
): string[] => {
  const rawValues = [
    ...(Array.isArray(activity.dates) ? activity.dates.filter(Boolean) : []),
    activity.main_date,
  ].filter(Boolean) as string[];

  const seen = new Set<number | string>();
  const unique: string[] = [];
  rawValues.forEach((value) => {
    const parsed = parseDateValue(value);
    const key = parsed ? parsed.getTime() : value;
    if (key === null || key === undefined) return;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(value);
  });

  return unique;
};

export const formatActivityDateValue = (
  value: string | Date | null | undefined,
): string | null =>
  formatDisplayDateTime(value) ??
  formatDisplayDate(value) ??
  (typeof value === "string" ? value : null);

export const hasTimeComponent = (
  value: string | Date | null | undefined
): boolean => {
  if (!value) return false;
  if (typeof value === "string") {
    return value.includes("T");
  }
  return value.getHours() !== 0 || value.getMinutes() !== 0;
};

export const formatDisplayTime = (
  value: string | Date | null | undefined
): string | null => {
  const date = parseDateValue(value);
  if (!date) return null;
  const locale = i18next.resolvedLanguage === "fr" ? "fr-FR" : "en-US";
  try {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
};
