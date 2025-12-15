import type { TFunction } from "i18next";

import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
  parseDateValue,
} from "./activityDisplay";
import { categoryNeedsDate } from "./activityHelper";
import type { DateStatusMeta } from "./dateEditor";
import type { Activity } from "../types";
import type { PlaceDetails } from "@features/import/types";

export const isActivityOwner = (
  activity: Activity | null,
  userId: string | null
): boolean => {
  if (!activity?.user_id) return true;
  if (!userId) return false;
  return activity.user_id === userId;
};

export const getOfficialDateInfo = (activity: Activity | null) => {
  const value = activity ? getOfficialDateValue(activity) : null;
  return {
    value,
    date: parseDateValue(value),
  };
};

export const resolveLocationLabel = ({
  activity,
  draftLocation,
  fallbackLabel,
}: {
  activity: Activity | null;
  draftLocation: PlaceDetails | null;
  fallbackLabel: string;
}) => {
  if (draftLocation) {
    return (
      draftLocation.formattedAddress ||
      draftLocation.name ||
      draftLocation.description ||
      fallbackLabel
    );
  }
  if (!activity) return null;
  return formatActivityLocation(activity) ?? fallbackLabel;
};

export const resolveDateLabel = ({
  activity,
  draftDate,
  fallbackLabel,
  officialDate,
  officialValue,
}: {
  activity: Activity | null;
  draftDate: Date | null;
  fallbackLabel: string;
  officialDate: Date | null;
  officialValue: string | null;
}) => {
  if (!activity) return null;
  const resolved = draftDate ?? officialDate ?? officialValue;
  return (
    formatDisplayDate(resolved) ?? fallbackLabel
  );
};

export const shouldShowDateSection = (
  activity: Activity | null,
  dateStatus: DateStatusMeta | null
) => {
  if (!activity) return false;
  return categoryNeedsDate(activity.category) || Boolean(dateStatus);
};

export const getFallbackLabels = (t: TFunction) => ({
  location: t("import:details.locationFallback"),
  date: t("activities:details.dateMissing"),
});

export const shouldShowActivityFooter = (
  createdParam: string | string[] | null | undefined
) => {
  if (!createdParam) return false;
  const value = Array.isArray(createdParam) ? createdParam[0] : createdParam;
  if (!value) return false;
  const normalized = value.toString().trim().toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "import" ||
    normalized === "created"
  );
};
