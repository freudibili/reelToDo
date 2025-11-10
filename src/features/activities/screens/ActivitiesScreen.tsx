import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Text, StyleSheet } from "react-native";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
  addFavorite,
  removeFavorite,
  deleteActivity,
  createActivityCalendarEvent,
  openActivityInMaps,
  openActivitySource,
} from "../store/activitiesSlice";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivityList from "../components/ActivityList";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const grouped = useAppSelector(activitiesSelectors.groupedByCategory);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);
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

  return (
    <Screen loading={loading && !initialized}>
      <Text style={styles.header}>Activities</Text>

      <ActivityList
        data={grouped}
        onSelect={handleSelect}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

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
              dispatch(createActivityCalendarEvent(activity.id));
            }}
          />
        </AppBottomSheet>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
});

export default ActivitiesScreen;
