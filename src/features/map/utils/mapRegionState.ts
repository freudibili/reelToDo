import { useEffect, useState } from "react";
import { Alert } from "react-native";
import type { Region } from "react-native-maps";
import type { TFunction } from "i18next";

import type { Activity } from "@features/activities/types";
import { requestUserRegion } from "../services/locationService";
import { buildInitialRegion } from "./regionUtils";

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
          activities,
        });

        setUserRegion(regionFromLocation ?? finalRegion);
        setInitialRegion(finalRegion);
      } catch (error) {
        if (!isMounted) return;

        const fallbackRegion = buildInitialRegion({
          userRegion: null,
          activities,
        });

        setUserRegion(fallbackRegion);
        setInitialRegion(fallbackRegion);

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
  }, [activities, fallbackAddress, t]);

  return { userRegion, initialRegion, ready };
};
