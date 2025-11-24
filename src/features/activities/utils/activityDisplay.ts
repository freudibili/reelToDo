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

export const formatActivityLocation = (
  activity: Pick<Activity, "location_name" | "city" | "country" | "address">
): string | null => {
  const main = activity.location_name || activity.address;
  const region = activity.city || activity.country;
  const label = [main, region].filter(Boolean).join(" • ");
  return label || null;
};

export const parseDateValue = (
  value: string | Date | null | undefined
): Date | null => {
  if (!value) return null;
  const parsed = typeof value === "string" ? new Date(value) : value;
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
