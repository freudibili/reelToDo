import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
  addFavorite,
  removeFavorite,
  deleteActivity,
  setPlannedDate,
} from "../store/activitiesSlice";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivityList from "../components/ActivityList";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import { useTranslation } from "react-i18next";
import {
  openActivityInMaps,
  openActivitySource,
} from "../services/linksService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";
import { Alert } from "react-native";
import LocationChangeModal from "@common/components/LocationChangeModal";
import type { PlaceDetails } from "@features/import/services/locationService";
import { ActivitiesService } from "../services/activitiesService";

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const grouped = useAppSelector(activitiesSelectors.groupedByCategory);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalActivity, setLocationModalActivity] =
    useState<Activity | null>(null);
  const [locationSubmitting, setLocationSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener(userId));
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch, userId]);

  const handleSelect = (activity: Activity) => {
    setSelectedId(activity.id);
    setSheetVisible(true);
  };

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

  const handleOpenImport = useCallback(() => {
    router.push({ pathname: "/import", params: { from: "activities" } });
  }, [router]);

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
      loading={loading && !initialized}
      flushBottom
      headerTitle={t("activities:header")}
      headerRight={
        <Pressable onPress={handleOpenImport} style={styles.importPressable}>
          <LinearGradient
            colors={["#0ea5e9", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.importBtn}
          >
            <View style={styles.importContent}>
              <Icon source="link-plus" size={16} color="#fff" />
              <Text style={styles.importText}>
                {t("activities:list.importFromLink")}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      }
    >
      <ActivityList data={grouped} onSelect={handleSelect} />

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

export default ActivitiesScreen;

const styles = StyleSheet.create({
  importBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    shadowColor: "#0f172a",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  importPressable: {
    borderRadius: 999,
  },
  importContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  importText: {
    fontSize: 12.5,
    color: "#fff",
    fontWeight: "700",
  },
});
