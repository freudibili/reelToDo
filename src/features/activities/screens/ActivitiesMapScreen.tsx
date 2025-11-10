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
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Region } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivitiesMap from "../components/ActivityMap";
import NearbyActivitiesSheet from "../components/NearbyActivitiesSheet";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import {
  deleteActivity,
  addFavorite,
  removeFavorite,
} from "../store/activitiesSlice";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/ui/Screen";

const ActivitiesMapScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [mode, setMode] = useState<"list" | "details">("list");
  const [sheetIndex, setSheetIndex] = useState(-1);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Impossible d'accéder à votre position."
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
  }, []);

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

  const handleSelectActivity = useCallback((activity: Activity) => {
    setSelected(activity);
    setMode("details");
    setSheetIndex(0);
  }, []);

  const handleMapSelect = useCallback(
    (activity: Activity) => {
      handleSelectActivity(activity);
    },
    [handleSelectActivity]
  );

  const handleBackToList = useCallback(() => {
    setMode("list");
    setSelected(null);
    setSheetIndex(-1);
  }, []);

  const handleDelete = useCallback(
    (activity: Activity) => {
      confirm(
        "Supprimer cette activité ?",
        "Cette action est définitive.",
        () => {
          dispatch(deleteActivity(activity.id));
          handleBackToList();
        },
        { cancelText: "Annuler", confirmText: "Supprimer" }
      );
    },
    [confirm, dispatch, handleBackToList]
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
  };

  if (!initialized || loading || !initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen noPadding>
      <ActivitiesMap
        activities={activities}
        initialRegion={initialRegion}
        onSelectActivity={handleMapSelect}
      />
      <Pressable
        style={[styles.fab, { bottom: 16 + insets.bottom }]}
        onPress={handleShowNearby}
      >
        <Text style={styles.fabText}>☰</Text>
      </Pressable>
      <BottomSheet
        ref={sheetRef}
        index={sheetIndex}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={
          mode === "details" ? handleBackToList : () => setSheetIndex(-1)
        }
      >
        <BottomSheetView
          style={[styles.sheetContent, { paddingBottom: insets.bottom || 12 }]}
        >
          {mode === "list" ? (
            <NearbyActivitiesSheet
              activities={activities}
              userRegion={userRegion}
              onSelectActivity={handleSelectActivity}
            />
          ) : (
            <ActivityDetailsSheet
              activity={selected}
              isFavorite={selected ? favoriteIds.includes(selected.id) : false}
              onClose={handleBackToList}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onOpenMaps={handleOpenMaps}
              onOpenSource={handleOpenSource}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </Screen>
  );
};

export default ActivitiesMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  fabText: {
    color: "#fff",
    fontSize: 20,
  },
  sheetContent: {
    flex: 1,
  },
});
