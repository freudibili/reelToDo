import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
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
  const snapPoints = useMemo(() => ["25%", "60%", "90%"], []);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener());
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch]);

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

  return (
    <Screen
      loading={loading && !initialized}
      flushBottom
      headerTitle={t("activities:header")}
    >
      <ActivityList data={grouped} onSelect={handleSelect} />

      {sheetVisible && (
        <AppBottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
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
          />
        </AppBottomSheet>
      )}
    </Screen>
  );
};

export default ActivitiesScreen;
