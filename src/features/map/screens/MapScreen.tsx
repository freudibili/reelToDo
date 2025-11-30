import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Alert,
  Pressable,
  Text,
  ScrollView,
} from "react-native";
import type { Region } from "react-native-maps";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
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

const MapScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const { colors, mode: themeMode } = useAppTheme();
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const selectedCategory = useAppSelector(mapSelectors.selectedCategory);

  const [userRegion, setUserRegion] = useState<Region | null>(null);
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
  const sheetRef = useRef(null);
  const mapRef = useRef<ActivitiesMapHandle | null>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const region = await requestUserRegion();
      if (!region) {
        Alert.alert(
          t("activities:map.permissionDeniedTitle"),
          t("activities:map.permissionDeniedMessage")
        );
        return;
      }
      setUserRegion(region);
    };

    requestLocation().catch(() => {});
  }, [t]);

  const initialRegion = useMemo<Region>(() => {
    if (userRegion) return userRegion;
    const withCoords = activities.find(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );
    if (withCoords) {
      return {
        latitude: withCoords.latitude as number,
        longitude: withCoords.longitude as number,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
    }
    return {
      latitude: 47.3769,
      longitude: 8.5417,
      latitudeDelta: 0.35,
      longitudeDelta: 0.35,
    };
  }, [userRegion, activities]);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close?.();
    setSheetIndex(-1);
    setSheetMode("list");
    setSelectedId(null);
  }, []);

  // ⬇️ ici la modif : on snap à l'index 0 au lieu d'expand
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
        },
        {
          cancelText: t("activities:confirmDelete.cancel"),
          confirmText: t("activities:confirmDelete.confirm"),
        }
      );
    },
    [confirm, dispatch, handleCloseSheet, t]
  );

  const handleToggleFavorite = useCallback(
    (activity: Activity) => {
      const isFav = favoriteIds.includes(activity.id);
      if (isFav) dispatch(removeFavorite(activity.id));
      else dispatch(addFavorite(activity.id));
    },
    [favoriteIds, dispatch]
  );

  const handleOpenMaps = useCallback(
    (activity: Activity) => openActivityInMaps(activity),
    []
  );

  const handleOpenSource = useCallback(
    (activity: Activity) => openActivitySource(activity),
    []
  );

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

  const handleShowNearby = () => {
    setSheetMode("list");
    setSheetIndex(0);
    sheetRef.current?.snapToIndex?.(0);
  };

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [activities]);

  const isLoading = !initialized || loading || !initialRegion;

  return (
    <Screen noPadding loading={isLoading}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("activities:map.title")}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.headerContent}
        >
          <Pressable
            onPress={() => handleCategoryChange(null)}
            style={[
              styles.chip,
              { backgroundColor: colors.overlay, borderColor: colors.border },
              selectedCategory === null && styles.chipActive,
              selectedCategory === null && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === null && styles.chipTextActive,
                { color: colors.text },
                selectedCategory === null && { color: "#fff" },
              ]}
            >
              {t("activities:map.all")}
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.chip,
                { backgroundColor: colors.overlay, borderColor: colors.border },
                selectedCategory === cat && styles.chipActive,
                selectedCategory === cat && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat && styles.chipTextActive,
                  { color: colors.text },
                  selectedCategory === cat && { color: "#fff" },
                ]}
              >
                {formatCategoryName(cat)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapContainer}>
        <ActivitiesMap
          ref={mapRef}
          activities={activities}
          initialRegion={initialRegion}
          onSelectActivity={handleMapSelect}
          selectedCategory={selectedCategory}
        />

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
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 22,
    fontWeight: "700",
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: {},
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    zIndex: 20,
    bottom: 16,
  },
  fabText: {
    fontSize: 20,
  },
});
