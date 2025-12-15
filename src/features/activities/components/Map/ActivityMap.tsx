import React, { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import type { Activity } from "../../utils/types";


interface Props {
  activities: Activity[];
  initialRegion: Region;
  onSelectActivity: (activity: Activity) => void;
  selectedCategory?: string | null;
}

export interface ActivitiesMapHandle {
  focusActivity: (activity: Activity) => void;
}

const ActivitiesMap = forwardRef<ActivitiesMapHandle, Props>(
  (
    {
      activities,
      initialRegion,
      onSelectActivity,
      selectedCategory,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const mapRef = useRef<MapView | null>(null);

    useImperativeHandle(ref, () => ({
      focusActivity: (activity: Activity) => {
        if (
          activity.latitude != null &&
          activity.longitude != null &&
          mapRef.current
        ) {
          const region: Region = {
            latitude: activity.latitude,
            longitude: activity.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          };
          mapRef.current.animateToRegion(region, 350);
        }
      },
    }));

    const visibleActivities = useMemo(() => {
      const filtered = !selectedCategory
        ? activities
        : activities.filter((a) => a.category === selectedCategory);
      return filtered.filter(
        (activity) =>
          typeof activity.latitude === "number" &&
          typeof activity.longitude === "number"
      );
    }, [activities, selectedCategory]);

    return (
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        {visibleActivities.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={{
              latitude: activity.latitude as number,
              longitude: activity.longitude as number,
            }}
            title={activity.title ?? t("common:labels.activity")}
            description={activity.location_name ?? activity.category ?? ""}
            onPress={() => onSelectActivity(activity)}
          />
        ))}
      </MapView>
    );
  }
);

ActivitiesMap.displayName = "ActivitiesMap";

export default ActivitiesMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
