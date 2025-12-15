import type BottomSheet from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import AppBottomSheet from "@common/components/AppBottomSheet";
import Screen from "@common/components/AppScreen";
import { Box, IconButton } from "@common/designSystem";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import ActivityDetailsSheet from "@features/activities/components/ActivityDetailsSheet";
import ActivitiesMap, {
  ActivitiesMapHandle,
} from "@features/activities/components/Map/ActivityMap";
import NearbyActivitiesSheet from "@features/activities/components/Map/NearbyActivitiesSheet";
import {
  openActivityInMaps,
  openActivitySource,
} from "@features/activities/services/linksService";
import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
import {
  deleteActivity,
  addFavorite,
  removeFavorite,
  setPlannedDate,
} from "@features/activities/store/activitiesSlice";
import type { Activity } from "@features/activities/types";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import { mapSelectors } from "@features/map/store/mapSelectors";
import { mapActions } from "@features/map/store/mapSlice";
import { useMapRegionState } from "@features/map/utils/mapRegionState";
import {
  getActivityCategories,
  getFallbackAddress,
} from "@features/map/utils/regionUtils";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";

import MapHeader from "../components/MapHeader";

const MapScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const profile = useAppSelector(settingsSelectors.profile);
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const selectedCategory = useAppSelector(mapSelectors.selectedCategory);

  const fallbackAddress = useMemo(
    () =>
      getFallbackAddress(
        profile.address,
        (user?.user_metadata as { address?: string } | undefined)?.address
      ),
    [profile.address, user?.user_metadata]
  );

  const {
    userRegion,
    initialRegion,
    ready: regionReady,
  } = useMapRegionState({
    activities,
    fallbackAddress,
    t,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSelector = useMemo(
    () => (selectedId ? activitiesSelectors.byId(selectedId) : null),
    [selectedId]
  );

  const selected = useAppSelector((state) =>
    selectedSelector ? selectedSelector(state) : null
  );

  const [sheetMode, setSheetMode] = useState<"list" | "details">("list");
  const [sheetIndex, setSheetIndex] = useState(-1);
  const sheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<ActivitiesMapHandle | null>(null);

  const snapPoints = useMemo(
    () => (sheetMode === "list" ? ["25%", "60%"] : ["25%", "60%", "90%"]),
    [sheetMode]
  );

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

  const isLoading = !initialized || loading || !regionReady || !initialRegion;

  return (
    <Screen noPadding loading={isLoading}>
      <MapHeader
        allLabel={t("activities:map.all")}
        categories={categories}
        selectedCategory={selectedCategory}
        onChangeCategory={handleCategoryChange}
        renderCategoryLabel={formatCategoryName}
      />

      <Box style={styles.mapContainer}>
        {initialRegion && (
          <ActivitiesMap
            ref={mapRef}
            activities={activities}
            initialRegion={initialRegion}
            onSelectActivity={handleMapSelect}
            selectedCategory={selectedCategory}
          />
        )}

        <Box style={styles.fabContainer}>
          <IconButton
            icon="format-list-bulleted"
            tone="primary"
            variant="filled"
            size={54}
            shadow="lg"
            onPress={handleShowNearby}
            accessibilityLabel={t("activities:map.openList")}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          />
        </Box>
      </Box>

      <AppBottomSheet
        ref={sheetRef}
        index={sheetIndex}
        onClose={handleCloseSheet}
        snapPoints={snapPoints}
      >
        {sheetMode === "list" ? (
          <NearbyActivitiesSheet
            activities={activities}
            userRegion={userRegion}
            category={selectedCategory}
            onSelectActivity={handleSelectFromNearby}
            tabBarHeight={tabBarHeight}
          />
        ) : (
          <ActivityDetailsSheet
            activity={selected}
            isFavorite={selected ? favoriteIds.includes(selected.id) : false}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onOpenMaps={handleOpenMaps}
            onOpenSource={handleOpenSource}
            onChangePlannedDate={handleSetPlannedDate}
            tabBarHeight={tabBarHeight}
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
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 16,
    zIndex: 20,
  },
});
