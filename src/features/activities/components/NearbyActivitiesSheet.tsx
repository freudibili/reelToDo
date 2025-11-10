import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import type { Region } from "react-native-maps";
import type { Activity } from "../utils/types";

interface Props {
  activities: Activity[];
  userRegion: Region | null;
  category?: string | null;
  onSelectActivity: (activity: Activity) => void;
  onClose: () => void;
}

const toRad = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyActivitiesSheet: React.FC<Props> = ({
  activities,
  userRegion,
  category,
  onSelectActivity,
}) => {
  const sorted = useMemo(() => {
    const base = category
      ? activities.filter((a) => a.category === category)
      : activities;

    const withCoords = base.filter(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );

    const asRows = withCoords.map((a) => ({
      activity: a,
      distance:
        userRegion && a.latitude != null && a.longitude != null
          ? getDistanceKm(
              userRegion.latitude,
              userRegion.longitude,
              a.latitude,
              a.longitude
            )
          : null,
    }));

    if (!userRegion) {
      return asRows.slice(0, 20);
    }

    return asRows
      .sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      })
      .slice(0, 20);
  }, [activities, userRegion, category]);

  return (
    <View>
      <Text style={styles.title}>À proximité</Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.activity.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectActivity(item.activity)}
            style={styles.row}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>
                {item.activity.title ?? "Sans titre"}
              </Text>
              <Text style={styles.sub}>
                {item.activity.location_name ?? item.activity.category ?? ""}
              </Text>
            </View>
            {item.distance != null ? (
              <Text style={styles.distance}>
                {item.distance < 1
                  ? `${Math.round(item.distance * 1000)} m`
                  : `${item.distance.toFixed(1)} km`}
              </Text>
            ) : null}
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default NearbyActivitiesSheet;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
  },
  sub: {
    fontSize: 12,
    color: "#666",
  },
  distance: {
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
});
