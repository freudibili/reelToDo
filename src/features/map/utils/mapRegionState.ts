import type { TFunction } from "i18next";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { Region } from "react-native-maps";

import type { Activity } from "@features/activities/types";

import { DEFAULT_REGION, buildInitialRegion } from "./regionUtils";
import { requestUserRegion } from "../services/locationService";

type MapRegionState = {
  userRegion: Region | null;
  initialRegion: Region | null;
  ready: boolean;
};

export const useMapRegionState = ({
  activities,
  fallbackAddress,
  t,
}: {
  activities: Activity[];
  fallbackAddress: string | null;
  t: TFunction;
}): MapRegionState => {
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [ready, setReady] = useState(false);
  const activitiesRef = useRef<Activity[]>(activities);

  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  useEffect(() => {
    if (!initialRegion || userRegion) return;

    const usingDefaultRegion =
      initialRegion.latitude === DEFAULT_REGION.latitude &&
      initialRegion.longitude === DEFAULT_REGION.longitude &&
      initialRegion.latitudeDelta === DEFAULT_REGION.latitudeDelta &&
      initialRegion.longitudeDelta === DEFAULT_REGION.longitudeDelta;

    if (!usingDefaultRegion) return;

    const nextRegion = buildInitialRegion({
      userRegion: null,
      activities,
    });

    const isSameRegion =
      nextRegion.latitude === initialRegion.latitude &&
      nextRegion.longitude === initialRegion.longitude &&
      nextRegion.latitudeDelta === initialRegion.latitudeDelta &&
      nextRegion.longitudeDelta === initialRegion.longitudeDelta;

    if (!isSameRegion) {
      setInitialRegion(nextRegion);
    }
  }, [activities, initialRegion, userRegion]);

  useEffect(() => {
    let isMounted = true;

    const loadRegion = async () => {
      try {
        const regionFromLocation = await requestUserRegion(fallbackAddress);
        if (!isMounted) return;

        if (!regionFromLocation) {
          Alert.alert(
            t("activities:map.permissionDeniedTitle"),
            t("activities:map.permissionDeniedMessage")
          );
        }

        const finalRegion = buildInitialRegion({
          userRegion: regionFromLocation,
          activities: activitiesRef.current,
        });

        setUserRegion(regionFromLocation ?? finalRegion);
        setInitialRegion((prev) => prev ?? finalRegion);
      } catch {
        if (!isMounted) return;

        const fallbackRegion = buildInitialRegion({
          userRegion: null,
          activities: activitiesRef.current,
        });

        setUserRegion(fallbackRegion);
        setInitialRegion((prev) => prev ?? fallbackRegion);

        Alert.alert(
          t("activities:map.permissionDeniedTitle"),
          t("activities:map.permissionDeniedMessage")
        );
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    };

    setReady(false);
    loadRegion();

    return () => {
      isMounted = false;
    };
  }, [fallbackAddress, t]);

  return { userRegion, initialRegion, ready };
};
