import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  Pressable,
  Text,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import type { Region } from "react-native-maps";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivitiesMap, {
  ActivitiesMapHandle,
} from "../components/Map/ActivityMap";
import NearbyActivitiesSheet from "../components/Map/NearbyActivitiesSheet";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import {
  deleteActivity,
  addFavorite,
  removeFavorite,
} from "../store/activitiesSlice";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import { useTranslation } from "react-i18next";

const ActivitiesMapScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);

  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [mode, setMode] = useState<"list" | "details">("list");
  const [sheetIndex, setSheetIndex] = useState(-1);
  const [category, setCategory] = useState<string | null>(null);

  const sheetRef = useRef(null);
  const mapRef = useRef<ActivitiesMapHandle | null>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("activities:map.permissionDeniedTitle"),
          t("activities:map.permissionDeniedMessage")
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
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

  const snapPoints = useMemo(() => {
    if (mode === "list") return ["45%"];
    return ["50%"];
  }, [mode]);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close?.();
    setSheetIndex(-1);
    setMode("list");
    setSelected(null);
  }, []);

  // ⬇️ ici la modif : on snap à l'index 0 au lieu d'expand
  const openDetails = useCallback((activity: Activity) => {
    setSelected(activity);
    setMode("details");
    setSheetIndex(0);
    sheetRef.current?.snapToIndex?.(0);
  }, []);

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

  const handleOpenMaps = useCallback((activity: Activity) => {
    if (activity.latitude && activity.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
      Linking.openURL(url);
      return;
    }
    const query =
      activity.address ||
      activity.location_name ||
      activity.city ||
      activity.title;
    if (query) {
      const encoded = encodeURIComponent(query);
      const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
      Linking.openURL(url);
    }
  }, []);

  const handleOpenSource = useCallback((activity: Activity) => {
    if (activity.source_url) {
      Linking.openURL(activity.source_url);
    }
  }, []);

  const handleShowNearby = () => {
    setMode("list");
    setSheetIndex(0);
    sheetRef.current?.snapToIndex?.(0);
  };

  const handleSelectFromNearby = useCallback(
    (activity: Activity) => {
      if (activity.latitude != null && activity.longitude != null) {
        mapRef.current?.focusActivity(activity);
      }
      openDetails(activity); // va ouvrir en 50%
    },
    [openDetails]
  );

  const handleCategoryChange = useCallback((next: string | null) => {
    setCategory(next);
  }, []);

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
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.headerContent}
        >
          <Pressable
            onPress={() => handleCategoryChange(null)}
            style={[styles.chip, category === null && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === null && styles.chipTextActive,
                ]}
              >
                {t("activities:map.all")}
              </Text>
            </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[styles.chip, category === cat && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat && styles.chipTextActive,
                ]}
              >
                {cat}
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
          selectedCategory={category}
          onCategoryChange={handleCategoryChange}
        />

        <Pressable style={styles.fab} onPress={handleShowNearby}>
          <Text style={styles.fabText}>☰</Text>
        </Pressable>
      </View>

      <AppBottomSheet
        ref={sheetRef}
        index={sheetIndex}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        scrollable={mode === "details"}
      >
        {mode === "list" ? (
          <NearbyActivitiesSheet
            activities={activities}
            userRegion={userRegion}
            category={category}
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
            onAddToCalendar={() => {}}
          />
        )}
      </AppBottomSheet>
    </Screen>
  );
};

export default ActivitiesMapScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: "rgba(15,23,42,0.05)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: "#0f172a",
  },
  chipText: {
    fontSize: 13,
    color: "#0f172a",
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
    backgroundColor: "#0f172a",
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
    color: "#fff",
    fontSize: 20,
  },
});
