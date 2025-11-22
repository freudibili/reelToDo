import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { activitiesSelectors } from "../store/activitiesSelectors";
import {
  addFavorite,
  removeFavorite,
  deleteActivity,
  createActivityCalendarEvent,
  openActivityInMaps,
  openActivitySource,
} from "../store/activitiesSlice";
import ActivityCard from "../components/ActivityCard";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen, { ScreenHeader } from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import { useTranslation } from "react-i18next";

const ActivitiesCategoryScreen = () => {
  const { category: categoryParam } = useLocalSearchParams<{
    category?: string;
  }>();
  const category =
    typeof categoryParam === "string"
      ? categoryParam
      : (categoryParam?.[0] ?? "other");

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const categorySelector = useMemo(
    () => activitiesSelectors.byCategory(category),
    [category]
  );
  const activities = useAppSelector(categorySelector);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);

  const [selected, setSelected] = useState<Activity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "60%", "90%"], []);

  const handleSelect = useCallback((activity: Activity) => {
    setSelected(activity);
    setSheetVisible(true);
  }, []);

  const handleClose = () => {
    setSheetVisible(false);
    setSelected(null);
  };

  const handleToggleFavorite = useCallback(
    (id: string, next?: boolean) => {
      const isFav = next ?? favoriteIds.includes(id);
      if (isFav) {
        dispatch(removeFavorite(id));
      } else {
        dispatch(addFavorite(id));
      }
    },
    [dispatch, favoriteIds]
  );

  const handleDelete = useCallback(
    (activity: Activity) => {
      confirm(
        t("activities:confirmDelete.title"),
        t("activities:confirmDelete.description"),
        () => {
          dispatch(deleteActivity(activity.id));
          handleClose();
        },
        {
          cancelText: t("activities:confirmDelete.cancel"),
          confirmText: t("activities:confirmDelete.confirm"),
        }
      );
    },
    [confirm, dispatch, t]
  );

  const categoryLabel =
    category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();

  return (
    <Screen>
      <ScreenHeader
        title={categoryLabel || t("activities:category.fallbackTitle")}
        subtitle={t("activities:category.subtitle", {
          count: activities.length,
        })}
        onBackPress={() => router.back()}
        compact
      />

      <ScrollView contentContainerStyle={styles.list}>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.cardSpacer}>
            <ActivityCard
              activity={activity}
              onPress={handleSelect}
            />
          </View>
        ))}

        {activities.length === 0 && (
          <View style={styles.empty}>
            <Text>{t("activities:category.empty")}</Text>
          </View>
        )}
      </ScrollView>

      {sheetVisible && (
        <AppBottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          onClose={handleClose}
        >
          <ActivityDetailsSheet
            activity={selected}
            isFavorite={selected ? favoriteIds.includes(selected.id) : false}
            onDelete={handleDelete}
            onToggleFavorite={(activity) => handleToggleFavorite(activity.id)}
            onOpenMaps={(activity) => {
              dispatch(openActivityInMaps(activity.id));
            }}
            onOpenSource={(activity) => {
              dispatch(openActivitySource(activity.id));
            }}
            onAddToCalendar={(activity) => {
              dispatch(
                createActivityCalendarEvent({
                  activityId: activity.id,
                })
              );
            }}
          />
        </AppBottomSheet>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  cardSpacer: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  empty: { marginTop: 40, alignItems: "center" },
});

export default ActivitiesCategoryScreen;
