import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { activitiesSelectors } from "../store/activitiesSelectors";
import {
  addFavorite,
  removeFavorite,
  deleteActivity,
  setPlannedDate,
} from "../store/activitiesSlice";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";
import ActivityCard from "../components/ActivityCard";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import { useTranslation } from "react-i18next";
import {
  openActivityInMaps,
  openActivitySource,
} from "../services/linksService";
import { formatCategoryName } from "../utils/categorySummary";

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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSelector = useMemo(
    () => (selectedId ? activitiesSelectors.byId(selectedId) : null),
    [selectedId]
  );
  const selected = useAppSelector((state) =>
    selectedSelector ? selectedSelector(state) : null
  );
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);

  const handleSelect = useCallback((activity: Activity) => {
    setSelectedId(activity.id);
    setSheetVisible(true);
  }, []);

  const handleClose = () => {
    setSheetVisible(false);
    setSelectedId(null);
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

  const categoryLabel = formatCategoryName(category);

  const handleSetPlannedDate = useCallback(
    (activity: Activity, planned: Date | null) => {
      dispatch(
        setPlannedDate({
          activityId: activity.id,
          plannedAt: planned,
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <Screen
        scrollable
        flushBottom
        headerTitle={categoryLabel || t("activities:category.fallbackTitle")}
        headerSubtitle={t("activities:category.subtitle", {
          count: activities.length,
        })}
        onBackPress={() => router.back()}
        headerCompact
      >
        <View style={styles.list}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.cardSpacer}>
              <ActivityCard
                activity={activity}
                onPress={handleSelect}
                isFavorite={favoriteIds.includes(activity.id)}
                onToggleFavorite={(item) => handleToggleFavorite(item.id)}
              />
            </View>
          ))}

          {activities.length === 0 && (
            <View style={styles.empty}>
              <Text>{t("activities:category.empty")}</Text>
            </View>
          )}
        </View>
      </Screen>

      {sheetVisible && (
        <AppBottomSheet
          ref={sheetRef}
          index={1}
          onClose={handleClose}
          scrollable
        >
          <ActivityDetailsSheet
            activity={selected}
            isFavorite={selected ? favoriteIds.includes(selected.id) : false}
            onDelete={handleDelete}
            onToggleFavorite={(activity) => handleToggleFavorite(activity.id)}
            onOpenMaps={(activity) => openActivityInMaps(activity)}
            onOpenSource={(activity) => openActivitySource(activity)}
            onAddToCalendar={(activity) => {
              dispatch(
                createActivityCalendarEvent({
                  activityId: activity.id,
                  activityDate: activity.planned_at
                    ? { start: activity.planned_at }
                    : undefined,
                })
              );
            }}
            onChangePlannedDate={handleSetPlannedDate}
          />
        </AppBottomSheet>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 12,
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
