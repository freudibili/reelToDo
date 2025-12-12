import type { TFunction } from "i18next";
import { updateImportedActivityDetails } from "@features/import/services/importService";
import { categoryNeedsDate } from "./activityHelper";
import {
  getOfficialDateValue,
  isSameDateValue,
} from "./activityDisplay";
import type { Activity } from "./types";

export type DateStatusTone = "warning" | "success" | "info";

export type DateStatusMeta = {
  label: string;
  helper: string;
  tone: DateStatusTone;
  needsConfirmation: boolean;
};
export type DateAction = "save" | "suggest" | "continue";

export const resolveDateStatus = (
  activity: Activity,
  t: TFunction<"translation">,
): DateStatusMeta | null => {
  const needsDate = categoryNeedsDate(activity.category);
  const officialDateValue = getOfficialDateValue(activity);
  const hasOfficialDate = !!officialDateValue;
  const needsConfirmation = activity.needs_date_confirmation;

  if (!needsDate && !needsConfirmation && !hasOfficialDate) {
    return null;
  }

  if (needsDate && !hasOfficialDate) {
    return {
      label: t("activities:dateStatus.missingLabel"),
      helper: t("activities:dateStatus.missing"),
      tone: "warning",
      needsConfirmation: true,
    };
  }

  if (needsConfirmation) {
    return {
      label: t("activities:dateStatus.needsConfirmLabel"),
      helper: t("activities:dateStatus.needsConfirm"),
      tone: "warning",
      needsConfirmation: true,
    };
  }

  if (hasOfficialDate) {
    return {
      label: t("activities:dateStatus.confirmedLabel"),
      helper: t("activities:dateStatus.confirmed"),
      tone: "success",
      needsConfirmation: false,
    };
  }

  return {
    label: t("activities:dateStatus.optionalLabel"),
    helper: t("activities:dateStatus.optional"),
    tone: "info",
    needsConfirmation: false,
  };
};

export const hasDateChanged = (activity: Activity, next: Date | null): boolean => {
  const current = getOfficialDateValue(activity);
  if (!current && !next) return false;
  if (!current || !next) return true;
  return !isSameDateValue(current, next);
};

export const resolveDateAction = (params: {
  activity: Activity;
  isOwner: boolean;
  draftDate: Date | null;
}): DateAction => {
  const { activity, isOwner, draftDate } = params;

  if (!draftDate) {
    return "continue";
  }

  const changed = hasDateChanged(activity, draftDate);

  if (isOwner) {
    return changed ? "save" : "continue";
  }

  return changed ? "suggest" : "continue";
};

export const saveActivityDate = async (activityId: string, date: Date) => {
  return updateImportedActivityDetails(activityId, {
    dateIso: date.toISOString(),
  });
};
