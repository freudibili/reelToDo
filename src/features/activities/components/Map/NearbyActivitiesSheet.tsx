import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import type { Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@common/theme/appTheme";
import { useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";

import type { Activity } from "../../utils/types";

import { NearbyActivityRow } from "./NearbyActivityRow";
import { useNearbyActivities } from "./useNearbyActivities";

interface Props {
  activities: Activity[];
  userRegion: Region | null;
  category?: string | null;
  onSelectActivity: (activity: Activity) => void;
  tabBarHeight?: number;
}

const NearbyActivitiesSheet: React.FC<Props> = ({
  activities,
  userRegion,
  category,
  onSelectActivity,
  tabBarHeight = 0,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const distanceUnit = useAppSelector(settingsSelectors.distanceUnit);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8) + tabBarHeight + 16;
  const nearbyActivities = useNearbyActivities(activities, userRegion, category);

  return (
    <BottomSheetFlatList
      data={nearbyActivities}
      keyExtractor={(item) => item.activity.id}
      style={styles.list}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: bottomPadding },
      ]}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <NearbyActivityRow
          entry={item}
          colors={colors}
          distanceUnit={distanceUnit}
          onSelectActivity={onSelectActivity}
          t={t}
        />
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
  separator: {
    height: 1,
  },
});
