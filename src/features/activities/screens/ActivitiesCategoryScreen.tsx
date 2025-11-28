import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
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
import LocationChangeModal from "@common/components/LocationChangeModal";
import type { PlaceDetails } from "@features/import/services/locationService";
import { ActivitiesService } from "../services/activitiesService";

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
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalActivity, setLocationModalActivity] =
    useState<Activity | null>(null);
  const [locationSubmitting, setLocationSubmitting] = useState(false);

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

  const categoryLabel =
    category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();

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

  const handleOpenLocationModal = useCallback((activity: Activity) => {
    setLocationModalActivity(activity);
    setLocationModalVisible(true);
  }, []);

  const handleCloseLocationModal = useCallback(() => {
    setLocationModalVisible(false);
    setLocationModalActivity(null);
  }, []);

  const handleSubmitLocation = useCallback(
    async (place: PlaceDetails) => {
      if (!locationModalActivity) return;
      setLocationSubmitting(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: locationModalActivity.id,
          userId,
          place,
          note: null,
        });
        Alert.alert(
          t("activities:report.successTitle"),
          t("activities:report.successMessage")
        );
        handleCloseLocationModal();
      } catch (e) {
        Alert.alert(
          t("activities:report.errorTitle"),
          t("activities:report.errorMessage")
        );
      } finally {
        setLocationSubmitting(false);
      }
    },
    [handleCloseLocationModal, locationModalActivity, t, userId]
  );

  return (
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
            <ActivityCard activity={activity} onPress={handleSelect} />
          </View>
        ))}

        {activities.length === 0 && (
          <View style={styles.empty}>
            <Text>{t("activities:category.empty")}</Text>
          </View>
        )}
      </View>

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
            onChangeLocation={handleOpenLocationModal}
          />
        </AppBottomSheet>
      )}

      <LocationChangeModal
        visible={locationModalVisible && !!locationModalActivity}
        onClose={handleCloseLocationModal}
        onSelectPlace={handleSubmitLocation}
        submitting={locationSubmitting}
        initialValue={
          locationModalActivity?.address ?? locationModalActivity?.location_name
        }
        title={t("activities:report.title")}
        subtitle={
          locationModalActivity
            ? t("activities:report.subtitle", {
                title:
                  locationModalActivity.title ??
                  t("common:labels.activity"),
              })
            : undefined
        }
      />
    </Screen>
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
