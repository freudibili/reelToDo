import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
  addFavorite,
  removeFavorite,
  deleteActivity,
} from "../store/activitiesSlice";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivityList from "../components/ActivityList";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const grouped = useAppSelector(activitiesSelectors.groupedByCategory);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener());
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch]);

  const handleSelect = (activity: Activity) => {
    setSelected(activity);
    setSheetVisible(true);
    sheetRef.current?.snapToIndex(1);
  };

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
        "Supprimer cette activité ?",
        "Cette action est définitive.",
        () => {
          dispatch(deleteActivity(activity.id));
          handleClose();
        },
        { cancelText: "Annuler", confirmText: "Supprimer" }
      );
    },
    [confirm, dispatch]
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activities</Text>
      {!initialized && loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ActivityList
          data={grouped}
          onSelect={handleSelect}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {sheetVisible && (
        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backgroundStyle={styles.sheetBg}
          handleIndicatorStyle={styles.handle}
        >
          <BottomSheetView>
            <ActivityDetailsSheet
              activity={selected}
              isFavorite={selected ? favoriteIds.includes(selected.id) : false}
              onClose={handleClose}
              onDelete={handleDelete}
              onToggleFavorite={(activity) => handleToggleFavorite(activity.id)}
              onOpenMaps={handleOpenMaps}
              onOpenSource={handleOpenSource}
            />
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  handle: {
    backgroundColor: "#d1d5db",
  },
});

export default ActivitiesScreen;
