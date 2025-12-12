import type { TFunction } from "i18next";
import { useMemo } from "react";

import type { Activity } from "../types";
import {
  formatActivityDateValue,
  formatActivityLocation,
  formatDisplayDate,
  formatDisplayDateTime,
  formatLocationEntry,
  getActivityDateValues,
  getActivityLocations,
  getOfficialDateValue,
  getPrimaryDateValue,
} from "../utils/activityDisplay";
import { categoryNeedsDate } from "../utils/activityHelper";

export type ActivityDetailsViewModel = {
  baseDate: Date;
  officialDateValue: string | null;
  officialDateLabel: string | null;
  plannedDateLabel: string | null;
  primaryDateLabel: string | null;
  formattedOfficialDates: string[];
  additionalDates: string[];
  alternateLocations: string[];
  locationLabel: string;
  needsDate: boolean;
};

export const useActivityDetailsViewModel = (
  activity: Activity | null,
  t: TFunction
): ActivityDetailsViewModel => {
  const officialDateValue = useMemo(
    () => (activity ? getOfficialDateValue(activity) : null),
    [activity]
  );

  const baseDate = useMemo(() => {
    if (!activity) return new Date();
    if (activity.planned_at) return new Date(activity.planned_at);
    if (officialDateValue) return new Date(officialDateValue);
    return new Date();
  }, [activity, officialDateValue]);

  const plannedDateLabel = useMemo(
    () => (activity ? formatDisplayDateTime(activity.planned_at) : null),
    [activity]
  );

  const primaryDateLabel = useMemo(
    () =>
      activity
        ? (formatDisplayDateTime(getPrimaryDateValue(activity)) ??
          formatDisplayDate(getPrimaryDateValue(activity)))
        : null,
    [activity]
  );

  const officialDateLabel = useMemo(
    () => formatDisplayDate(officialDateValue),
    [officialDateValue]
  );

  const officialDates = useMemo(
    () => (activity ? getActivityDateValues(activity) : []),
    [activity]
  );

  const formattedOfficialDates = useMemo(
    () =>
      officialDates
        .map((date) => formatActivityDateValue(date))
        .filter((date): date is string => Boolean(date)),
    [officialDates]
  );

  const additionalDates = useMemo(
    () => formattedOfficialDates.slice(1),
    [formattedOfficialDates]
  );

  const locations = useMemo(
    () => (activity ? getActivityLocations(activity) : []),
    [activity]
  );

  const locationLabel = useMemo(() => {
    if (!activity) return t("activities:details.locationFallback");
    const fallbackRegion = activity.city ?? activity.country ?? null;
    return (
      formatLocationEntry(locations[0], fallbackRegion) ??
      formatActivityLocation(activity) ??
      t("activities:details.locationFallback")
    );
  }, [activity, locations, t]);

  const alternateLocations = useMemo(
    () =>
      locations
        .slice(1)
        .map((loc) =>
          formatLocationEntry(loc, activity?.city ?? activity?.country ?? null)
        )
        .filter((loc): loc is string => Boolean(loc)),
    [activity?.city, activity?.country, locations]
  );

  const needsDate = useMemo(
    () => categoryNeedsDate(activity?.category),
    [activity?.category]
  );

  return {
    baseDate,
    officialDateValue,
    officialDateLabel,
    plannedDateLabel,
    primaryDateLabel,
    formattedOfficialDates,
    additionalDates,
    alternateLocations,
    locationLabel,
    needsDate,
  };
};
