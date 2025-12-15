import { useMemo } from "react";
import type { LatLng, Region } from "react-native-maps";

import { haversineDistanceKm } from "../../utils/distance";
import type { Activity } from "../../utils/types";

export type NearbyActivityEntry = {
  activity: Activity;
  distance: number | null;
};

const MAX_NEARBY_ITEMS = 20;

const deriveOrigin = (
  activities: Activity[],
  userRegion: Region | null
): LatLng | null => {
  if (userRegion) {
    return {
      latitude: userRegion.latitude,
      longitude: userRegion.longitude,
    };
  }
  const firstWithCoords = activities.find(
    (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
  );
  if (
    firstWithCoords?.latitude != null &&
    firstWithCoords.longitude != null
  ) {
    return {
      latitude: firstWithCoords.latitude,
      longitude: firstWithCoords.longitude,
    };
  }
  return null;
};

const computeDistance = (origin: LatLng | null, activity: Activity) => {
  if (origin && activity.latitude != null && activity.longitude != null) {
    return haversineDistanceKm(
      origin.latitude,
      origin.longitude,
      activity.latitude,
      activity.longitude
    );
  }
  const provided =
    typeof activity.distance === "number" ? (activity.distance as number) : null;
  return provided;
};

export const useNearbyActivities = (
  activities: Activity[],
  userRegion: Region | null,
  category?: string | null
): NearbyActivityEntry[] => {
  return useMemo(() => {
    const origin = deriveOrigin(activities, userRegion);
    const base = category
      ? activities.filter((a) => a.category === category)
      : activities;

    const withCoords = base.filter(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );

    const asRows = withCoords.map((activity) => ({
      activity,
      distance: computeDistance(origin, activity),
    }));

    if (!origin) {
      return asRows.slice(0, MAX_NEARBY_ITEMS);
    }

    return asRows
      .sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      })
      .slice(0, MAX_NEARBY_ITEMS);
  }, [activities, userRegion, category]);
};
