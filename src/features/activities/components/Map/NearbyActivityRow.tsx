import type { TFunction } from "i18next";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "@common/theme/appTheme";
import type { DistanceUnit } from "@features/settings/utils/types";

import { formatDistance } from "../../utils/distance";
import type { Activity } from "../../utils/types";

type Props = {
  entry: {
    activity: Activity;
    distance: number | null;
  };
  colors: Pick<AppTheme["colors"], "border" | "text" | "secondaryText">;
  t: TFunction;
  onSelectActivity: (activity: Activity) => void;
  distanceUnit: DistanceUnit;
};

export const NearbyActivityRow: React.FC<Props> = ({
  entry,
  colors,
  t,
  onSelectActivity,
  distanceUnit,
}) => {
  const { activity, distance } = entry;
  return (
    <Pressable
      onPress={() => onSelectActivity(activity)}
      style={[styles.row, { borderColor: colors.border }]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.name, { color: colors.text }]}>
          {activity.title ?? t("common:labels.untitled")}
        </Text>
        <Text style={[styles.sub, { color: colors.secondaryText }]}>
          {activity.location_name ?? activity.category ?? ""}
        </Text>
      </View>
      {distance != null ? (
        <Text style={[styles.distance, { color: colors.secondaryText }]}>
          {formatDistance(distance, distanceUnit)}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
});
