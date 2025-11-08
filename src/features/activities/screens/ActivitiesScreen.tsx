import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
  deleteActivity,
  addFavorite,
  removeFavorite,
} from "../store/activitiesSlice";
import { activitiesSelectors } from "../store/activitiesSelectors";
import type { AppDispatch } from "@core/store";
import ActivityList from "../components/ActivityList";
import ActivityDetailsModal from "../components/ActivityDetailsModal";
import type { Activity } from "../utils/types";

const ActivitiesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const grouped = useSelector(activitiesSelectors.groupedByCategory);
  const loading = useSelector(activitiesSelectors.loading);
  const initialized = useSelector(activitiesSelectors.initialized);
  const favoriteIds = useSelector(activitiesSelectors.favoriteIds);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener());

    return () => {
      stopActivitiesListener();
    };
  }, [dispatch]);

  const handleSelect = (activity: Activity) => {
    setSelected(activity);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteActivity(id));
    handleClose();
  };

  const handleToggleFavorite = (id: string, next?: boolean) => {
    const isFav = next ?? favoriteIds.includes(id);
    if (isFav) {
      dispatch(removeFavorite(id));
    } else {
      dispatch(addFavorite(id));
    }
  };

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
      <ActivityDetailsModal
        visible={modalVisible}
        activity={selected}
        onClose={handleClose}
        onDelete={handleDelete}
        isFavorite={!!selected && favoriteIds.includes(selected.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
});

export default ActivitiesScreen;
