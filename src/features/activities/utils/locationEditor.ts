import type { TFunction } from "i18next";
import { updateImportedActivityDetails } from "@features/import/services/importService";
import { ActivitiesService } from "../services/activitiesService";
import type { Activity } from "./types";
import type { PlaceDetails } from "@features/import/services/locationService";

export type LocationStatusTone = "warning" | "success" | "info";

export type LocationStatusMeta = {
  label: string;
  helper: string;
  tone: LocationStatusTone;
  needsConfirmation: boolean;
};

const unconfirmedStatuses: Array<Activity["location_status"]> = [
  "missing",
  "unconfirmed",
  null,
];

export const resolveLocationStatus = (
  activity: Activity,
  t: TFunction<"translation">,
): LocationStatusMeta => {
  const status = activity.location_status ?? null;
  const needsConfirmation =
    activity.needs_location_confirmation ||
    unconfirmedStatuses.includes(status);

  if (!activity.address && !activity.location_name) {
    return {
      label: t("activities:locationStatus.missingLabel"),
      helper: t("activities:locationStatus.missing"),
      tone: "warning",
      needsConfirmation: true,
    };
  }

  if (needsConfirmation) {
    return {
      label: t("activities:locationStatus.needsConfirmLabel"),
      helper: t("activities:locationStatus.needsConfirm"),
      tone: "warning",
      needsConfirmation: true,
    };
  }

  if (status === "suggested") {
    return {
      label: t("activities:locationStatus.suggestedLabel"),
      helper: t("activities:locationStatus.suggested"),
      tone: "info",
      needsConfirmation: false,
    };
  }

  return {
    label: t("activities:locationStatus.confirmedLabel"),
    helper: t("activities:locationStatus.confirmed"),
    tone: "success",
    needsConfirmation: false,
  };
};

export const derivePlaceFromActivity = (activity: Activity): PlaceDetails | null => {
  if (activity.latitude === null || activity.longitude === null) return null;

  return {
    placeId: activity.id,
    description:
      activity.address ??
      activity.location_name ??
      activity.city ??
      activity.country ??
      "",
    formattedAddress: activity.address ?? "",
    name: activity.location_name ?? activity.address ?? "Location",
    city: activity.city ?? null,
    country: activity.country ?? null,
    latitude: activity.latitude,
    longitude: activity.longitude,
  };
};

const nearlyEqual = (a: number | null, b: number | null, epsilon = 0.00001) => {
  if (a === null || b === null) return false;
  return Math.abs(a - b) < epsilon;
};

export const hasLocationChanged = (activity: Activity, next: PlaceDetails): boolean => {
  const sameLatLng =
    nearlyEqual(activity.latitude, next.latitude) && nearlyEqual(activity.longitude, next.longitude);
  const sameAddress =
    (activity.address ?? "").trim().toLowerCase() ===
    (next.formattedAddress ?? "").trim().toLowerCase();
  const sameName =
    (activity.location_name ?? "").trim().toLowerCase() === (next.name ?? "").trim().toLowerCase();

  // If coords exist, trust them; otherwise fall back to string comparison.
  if (activity.latitude !== null && activity.longitude !== null) {
    return !sameLatLng;
  }

  return !(sameAddress && sameName);
};

export const saveActivityLocation = async (
  activityId: string,
  place: PlaceDetails,
) => {
  return updateImportedActivityDetails(activityId, {
    location: place,
  });
};

export const deleteActivityCompletely = async (activityId: string, userId: string) => {
  await ActivitiesService.deleteActivity(userId, activityId);
  return activityId;
};
