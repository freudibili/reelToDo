import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { Region, LatLng } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@common/theme/appTheme";

import { haversineDistanceKm } from "../../utils/distance";
import type { Activity } from "../../utils/types";

interface Props {
  activities: Activity[];
  userRegion: Region | null;
  category?: string | null;
  onSelectActivity: (activity: Activity) => void;
  tabBarHeight?: number;
}

const MAX_NEARBY_ITEMS = 20;

const NearbyActivitiesSheet: React.FC<Props> = ({
  activities,
  userRegion,
  category,
  onSelectActivity,
  tabBarHeight = 0,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8) + tabBarHeight + 16;

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
    <BottomSheetFlatList
      data={sorted}
      keyExtractor={(item) => item.activity.id}
      style={styles.list}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: bottomPadding },
      ]}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
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
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      )}
      ListHeaderComponent={
        <Text style={[styles.title, { color: colors.text }]}>
          {t("activities:map.nearby")}
        </Text>
      }
    />
  );
};

export default NearbyActivitiesSheet;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
