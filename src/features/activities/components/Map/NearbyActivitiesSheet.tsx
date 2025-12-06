import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import type { Region, LatLng } from "react-native-maps";
import type { Activity } from "../../utils/types";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { haversineDistanceKm } from "../../utils/distance";

interface Props {
  activities: Activity[];
  userRegion: Region | null;
  category?: string | null;
  onSelectActivity: (activity: Activity) => void;
}

const MAX_NEARBY_ITEMS = 30;

const NearbyActivitiesSheet: React.FC<Props> = ({
  activities,
  userRegion,
  category,
  onSelectActivity,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const origin: LatLng | null = useMemo(() => {
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
  }, [activities, userRegion]);

  const sorted = useMemo(() => {
    const base = category
      ? activities.filter((a) => a.category === category)
      : activities;

    const withCoords = base.filter(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );

    const asRows = withCoords.map((a) => ({
      activity: a,
      distance: (() => {
        const computed =
          origin && a.latitude != null && a.longitude != null
            ? haversineDistanceKm(
                origin.latitude,
                origin.longitude,
                a.latitude,
                a.longitude
              )
            : null;
        // Fallback to backend-provided distance when available
        const provided =
          typeof a.distance === "number" ? (a.distance as number) : null;
        return computed ?? provided;
      })(),
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
  }, [activities, origin, category]);

  return (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("activities:map.nearby")}
      </Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.activity.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectActivity(item.activity)}
            style={[styles.row, { borderColor: colors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.activity.title ?? t("common:labels.untitled")}
              </Text>
              <Text style={[styles.sub, { color: colors.secondaryText }]}>
                {item.activity.location_name ?? item.activity.category ?? ""}
              </Text>
            </View>
            {item.distance != null ? (
              <Text style={[styles.distance, { color: colors.secondaryText }]}>
                {item.distance < 1
                  ? `${Math.round(item.distance * 1000)} m`
                  : `${item.distance.toFixed(1)} km`}
              </Text>
            ) : null}
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
        )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  },
  distance: {
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 1,
  },
});
