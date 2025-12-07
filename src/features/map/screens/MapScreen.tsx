import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View, StyleSheet, Alert, Pressable, Text } from "react-native";
import type { Region } from "react-native-maps";
import type BottomSheet from "@gorhom/bottom-sheet";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import ActivitiesMap, {
  ActivitiesMapHandle,
} from "@features/activities/components/Map/ActivityMap";
import NearbyActivitiesSheet from "@features/activities/components/Map/NearbyActivitiesSheet";
import ActivityDetailsSheet from "@features/activities/components/ActivityDetailsSheet";
import {
  deleteActivity,
  addFavorite,
  removeFavorite,
  setPlannedDate,
} from "@features/activities/store/activitiesSlice";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";
import type { Activity } from "@features/activities/utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import { useTranslation } from "react-i18next";
import { mapSelectors } from "@features/map/store/mapSelectors";
import { mapActions } from "@features/map/store/mapSlice";
import { requestUserRegion } from "@features/map/services/locationService";
import {
  openActivityInMaps,
  openActivitySource,
} from "@features/activities/services/linksService";
import { useAppTheme } from "@common/theme/appTheme";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";
import {
  buildInitialRegion,
  getActivityCategories,
  getFallbackAddress,
} from "@features/map/utils/regionUtils";
import MapHeader from "../components/MapHeader";

const MapScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const { colors, mode: themeMode } = useAppTheme();

  const profile = useAppSelector(settingsSelectors.profile);
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const selectedCategory = useAppSelector(mapSelectors.selectedCategory);

  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSelector = useMemo(
    () => (selectedId ? activitiesSelectors.byId(selectedId) : null),
    [selectedId]
  );

  const selected = useAppSelector((state) =>
    selectedSelector ? selectedSelector(state) : null
  );

  const fallbackAddress = useMemo(
    () =>
      getFallbackAddress(
        profile.address,
        (user?.user_metadata as { address?: string } | undefined)?.address
      ),
    [profile.address, user?.user_metadata]
  );

  const [sheetMode, setSheetMode] = useState<"list" | "details">("list");
  const [sheetIndex, setSheetIndex] = useState(-1);
  const sheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<ActivitiesMapHandle | null>(null);

  const snapPoints = useMemo(
    () => (sheetMode === "list" ? ["25%", "60%"] : ["25%", "60%", "90%"]),
    [sheetMode]
  );

  useEffect(() => {
    const load = async () => {
      const regionFromLocation = await requestUserRegion(fallbackAddress);

      if (!regionFromLocation) {
        Alert.alert(
          t("activities:map.permissionDeniedTitle"),
          t("activities:map.permissionDeniedMessage")
        );
      }

      const finalRegion = buildInitialRegion({
        userRegion: regionFromLocation,
        activities,
      });

      setUserRegion(regionFromLocation ?? finalRegion);
      setInitialRegion(finalRegion);
    };

    load().catch(() => {
      const fallbackRegion = buildInitialRegion({
        userRegion: null,
        activities,
      });

      setUserRegion(fallbackRegion);
      setInitialRegion(fallbackRegion);

      Alert.alert(
        t("activities:map.permissionDeniedTitle"),
        t("activities:map.permissionDeniedMessage")
      );
    });
  }, [fallbackAddress, activities, t]);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close?.();
    setSheetIndex(-1);
    setSheetMode("list");
    setSelectedId(null);
  }, []);

  const openDetails = useCallback(
    (activity: Activity) => {
      dispatch(mapActions.setLastFocusedActivity(activity.id));
      setSelectedId(activity.id);
      setSheetMode("details");
      setSheetIndex(0);
      sheetRef.current?.snapToIndex?.(0);
    },
    [dispatch]
  );

  const handleMapSelect = useCallback(
    (activity: Activity) => {
      openDetails(activity);
    },
    [openDetails]
  );

  const handleDelete = useCallback(
    (activity: Activity) => {
      confirm(
        t("activities:confirmDelete.title"),
        t("activities:confirmDelete.description"),
        () => {
          dispatch(deleteActivity(activity.id));
          handleCloseSheet();
        }
      );
    },
    [confirm, dispatch, handleCloseSheet, t]
  );

  const handleToggleFavorite = useCallback(
    (activity: Activity) => {
      const isFavorite = favoriteIds.includes(activity.id);
      if (isFavorite) {
        dispatch(removeFavorite(activity.id));
      } else {
        dispatch(addFavorite(activity.id));
      }
    },
    [favoriteIds, dispatch]
  );

  const handleOpenMaps = useCallback((activity: Activity) => {
    openActivityInMaps(activity);
  }, []);

  const handleOpenSource = useCallback((activity: Activity) => {
    openActivitySource(activity);
  }, []);

  const handleAddToCalendar = useCallback(
    (activity: Activity) => {
      dispatch(
        createActivityCalendarEvent({
          activityId: activity.id,
          activityDate: activity.planned_at
            ? { start: activity.planned_at }
            : undefined,
        })
      );
    },
    [dispatch]
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

  const handleShowNearby = useCallback(() => {
    setSheetMode("list");
    setSheetIndex(0);
    sheetRef.current?.snapToIndex?.(0);
  }, []);

  const handleSelectFromNearby = useCallback(
    (activity: Activity) => {
      if (activity.latitude != null && activity.longitude != null) {
        mapRef.current?.focusActivity(activity);
      }
      openDetails(activity);
    },
    [openDetails]
  );

  const handleCategoryChange = useCallback(
    (next: string | null) => {
      dispatch(mapActions.setSelectedCategory(next));
    },
    [dispatch]
  );

  const categories = useMemo(
    () => getActivityCategories(activities),
    [activities]
  );

  const isLoading = !initialized || loading || !initialRegion;

  return (
    <Screen noPadding loading={isLoading}>
      <MapHeader
        title={t("activities:map.title")}
        allLabel={t("activities:map.all")}
        colors={{
          border: colors.border,
          text: colors.text,
          overlay: colors.overlay,
          primary: colors.primary,
        }}
        categories={categories}
        selectedCategory={selectedCategory}
        onChangeCategory={handleCategoryChange}
        renderCategoryLabel={formatCategoryName}
      />

      <View style={styles.mapContainer}>
        {initialRegion && (
          <ActivitiesMap
            ref={mapRef}
            activities={activities}
            initialRegion={initialRegion}
            onSelectActivity={handleMapSelect}
            selectedCategory={selectedCategory}
          />
        )}

        <Pressable
          style={[
            styles.fab,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={handleShowNearby}
        >
          <Text
            style={[
              styles.fabText,
              { color: themeMode === "dark" ? colors.background : "#fff" },
            ]}
          >
            ☰
          </Text>
        </Pressable>
      </View>

      <AppBottomSheet
        ref={sheetRef}
        index={sheetIndex}
        onClose={handleCloseSheet}
        scrollable={sheetMode === "details"}
        snapPoints={snapPoints}
      >
        {sheetMode === "list" ? (
          <NearbyActivitiesSheet
            activities={activities}
            userRegion={userRegion}
            category={selectedCategory}
            onSelectActivity={handleSelectFromNearby}
          />
        ) : (
          <ActivityDetailsSheet
            activity={selected}
            isFavorite={selected ? favoriteIds.includes(selected.id) : false}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onOpenMaps={handleOpenMaps}
            onOpenSource={handleOpenSource}
            onAddToCalendar={handleAddToCalendar}
            onChangePlannedDate={handleSetPlannedDate}
          />
        )}
      </AppBottomSheet>
    </Screen>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 999,
    elevation: 4,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    fontSize: 20,
  },
});
