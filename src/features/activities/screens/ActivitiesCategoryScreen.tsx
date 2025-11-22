import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { activitiesSelectors } from "../store/activitiesSelectors";
import {
  addFavorite,
  removeFavorite,
  deleteActivity,
  createActivityCalendarEvent,
  openActivityInMaps,
  openActivitySource,
} from "../store/activitiesSlice";
import ActivityCard from "../components/ActivityCard";
import ActivityDetailsSheet from "../components/ActivityDetailsSheet";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen, { ScreenHeader } from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";

const ActivitiesCategoryScreen = () => {
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const category =
    typeof categoryParam === "string"
      ? categoryParam
      : categoryParam?.[0] ?? "other";

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const categorySelector = useMemo(
    () => activitiesSelectors.byCategory(category),
    [category]
  );
  const activities = useAppSelector(categorySelector);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);

  const [selected, setSelected] = useState<Activity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const handleSelect = useCallback((activity: Activity) => {
    setSelected(activity);
    setSheetVisible(true);
  }, []);

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

  const categoryLabel =
    category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();

  return (
    <Screen>
      <ScreenHeader
        title={categoryLabel || "Activities"}
        subtitle={`${activities.length} activités`}
        onBackPress={() => router.back()}
        compact
      />

      <ScrollView contentContainerStyle={styles.list}>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.cardSpacer}>
            <ActivityCard
              activity={activity}
              onPress={handleSelect}
              isFavorite={favoriteIds.includes(activity.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </View>
        ))}

        {activities.length === 0 && (
          <View style={styles.empty}>
            <Text>Aucune activité pour cette catégorie.</Text>
          </View>
        )}
      </ScrollView>

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
              dispatch(
                createActivityCalendarEvent({
                  activityId: activity.id,
                })
              );
            }}
          />
        </AppBottomSheet>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
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
