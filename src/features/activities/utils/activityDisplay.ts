import type { Activity } from "./types";
import i18next from "@common/i18n/i18n";

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

const getFirstArrayDate = (dates?: string[] | null): string | null => {
  if (!Array.isArray(dates) || dates.length === 0) return null;
  return dates[0] ?? null;
};

export const formatActivityLocation = (
  activity: Pick<
    Activity,
    "location_name" | "city" | "country" | "address" | "locations"
  >
): string | null => {
  const primaryLocation = Array.isArray(activity.locations) &&
      activity.locations.length > 0
    ? activity.locations[0]
    : null;
  const main =
    primaryLocation?.name ??
    primaryLocation?.address ??
    activity.location_name ??
    activity.address;
  const region =
    primaryLocation?.city ?? activity.city ?? activity.country;
  const label = [main, region].filter(Boolean).join(" • ");
  return label || null;
};

export const getPrimaryDateValue = (
  activity: Pick<Activity, "planned_at" | "dates" | "main_date">
): string | null =>
  activity.planned_at ??
  getFirstArrayDate(activity.dates) ??
  activity.main_date ??
  null;

export const getOfficialDateValue = (
  activity: Pick<Activity, "dates" | "main_date">
): string | null => getFirstArrayDate(activity.dates) ?? activity.main_date ?? null;

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
