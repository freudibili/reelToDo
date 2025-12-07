import type { Region } from "react-native-maps";
import type { Activity } from "@features/activities/utils/types";

export const DEFAULT_REGION: Region = {
  latitude: 47.3769,
  longitude: 8.5417,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

export const getFallbackAddress = (
  profileAddress?: string | null,
  metadataAddress?: string | null
): string | null => {
  const profile = profileAddress?.trim();
  const meta = metadataAddress?.trim();

  return profile || meta || null;
};

export const buildInitialRegion = ({
  userRegion,
  activities,
  fallbackRegion = DEFAULT_REGION,
}: {
  userRegion: Region | null;
  activities: Activity[];
  fallbackRegion?: Region;
}): Region => {
  if (userRegion) return userRegion;

  const withCoords = activities.find(
    (activity) =>
      typeof activity.latitude === "number" &&
      typeof activity.longitude === "number"
  );

  if (withCoords) {
    return {
      latitude: withCoords.latitude as number,
      longitude: withCoords.longitude as number,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }

  return fallbackRegion;
};

export const getActivityCategories = (activities: Activity[]): string[] => {
  const set = new Set<string>();

  activities.forEach((activity) => {
    if (activity.category) {
      set.add(activity.category);
    }
  });

  return Array.from(set);
};
