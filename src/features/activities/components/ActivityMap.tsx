import React, { useMemo, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { Region } from "react-native-maps";
import type { Activity } from "../utils/types";
import ActivitiesCategoryBar from "./ActivitiesCategoryBar";

interface Props {
  activities: Activity[];
  initialRegion: Region;
  onSelectActivity: (activity: Activity) => void;
}

const ActivitiesMap: React.FC<Props> = ({
  activities,
  initialRegion,
  onSelectActivity,
}) => {
  const grouped = useMemo(() => {
    const acc: Record<string, Activity[]> = {};
    activities.forEach((a) => {
      const key = a.category || "other";
      if (!acc[key]) acc[key] = [];
      acc[key] = acc[key].concat(a);
    });
    return acc;
  }, [activities]);

  const categories = useMemo(() => Object.keys(grouped), [grouped]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const visibleActivities = useMemo(() => {
    if (!categories.length) return [];
    const cat = selectedCategory ?? categories[0];
    return (grouped[cat] || []).filter(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );
  }, [grouped, selectedCategory, categories]);

  return (
    <View style={styles.container}>
      {categories.length > 0 ? (
        <ActivitiesCategoryBar
          categories={categories}
          selected={selectedCategory ?? categories[0]}
          onSelect={setSelectedCategory}
        />
      ) : null}
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {visibleActivities.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={{
              latitude: activity.latitude as number,
              longitude: activity.longitude as number,
            }}
            title={activity.title}
            description={activity.location_name ?? activity.category ?? ""}
            onPress={() => onSelectActivity(activity)}
          />
        ))}
      </MapView>
    </View>
  );
};

export default ActivitiesMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
