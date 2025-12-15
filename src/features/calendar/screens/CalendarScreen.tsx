import type BottomSheet from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import AppBottomSheet from "@common/components/AppBottomSheet";
import Screen from "@common/components/AppScreen";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import ActivityDetailsSheet from "@features/activities/components/ActivityDetailsSheet";
import {
  openActivityInMaps,
  openActivitySource,
} from "@features/activities/services/linksService";
import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
import {
  addFavorite,
  deleteActivity,
  fetchActivities,
  removeFavorite,
  setPlannedDate,
  startActivitiesListener,
  stopActivitiesListener,
} from "@features/activities/store/activitiesSlice";
import type { Activity } from "@features/activities/types";
import { formatDisplayDate } from "@features/activities/utils/activityDisplay";
import { calendarSelectors } from "@features/calendar/store/calendarSelectors";
import { calendarActions } from "@features/calendar/store/calendarSlice";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";
import { toDayKey } from "@features/calendar/utils/dates";
import { formatDayHeader } from "@features/calendar/utils/formatDayHeader";

import DayGrid from "../components/DayGrid";
import MonthNavigator from "../components/MonthNavigator";
import SelectedDayActivitiesSheet from "../components/SelectedDayActivitiesSheet";
import { buildDayGroups, buildMonthDays } from "../utils/calendarData";

const CalendarScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t, i18n } = useTranslation();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const activities = useAppSelector(activitiesSelectors.items);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const selectedDate = useAppSelector(calendarSelectors.selectedDate);
  const visibleMonthDate = useAppSelector(calendarSelectors.visibleMonthDate);
  const tabBarHeight = useBottomTabBarHeight();

  const locale = useMemo(
    () => (i18n.resolvedLanguage === "fr" ? "fr-FR" : "en-US"),
    [i18n.resolvedLanguage]
  );
  const [selected, setSelected] = useState<Activity | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSelector = useMemo(
    () => (selectedId ? activitiesSelectors.byId(selectedId) : null),
    [selectedId]
  );
  const selectedFromStore = useAppSelector((state) =>
    selectedSelector ? selectedSelector(state) : null
  );
  const [sheetMode, setSheetMode] = useState<"list" | "details">("list");
  const [sheetIndex, setSheetIndex] = useState(-1);
  const [initialSheetEvaluated, setInitialSheetEvaluated] = useState(false);
  const effectiveSelected = selectedFromStore ?? selected;
  const sheetRef = useRef<BottomSheet | null>(null);
  const snapPoints = useMemo(
    () => (sheetMode === "list" ? ["25%", "60%"] : ["25%", "60%", "90%"]),
    [sheetMode]
  );

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener(userId));
    dispatch(calendarActions.setSelectedDate(toDayKey(new Date())));
    dispatch(calendarActions.setVisibleMonth(toDayKey(new Date())));
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch, userId]);

  const dayGroups = useMemo(() => buildDayGroups(activities), [activities]);
  const todayKey = useMemo(() => toDayKey(new Date()), []);
  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
  const selectedGroup = dayGroups.find((g) => g.key === selectedDate) ?? null;
  const selectedEntries = selectedGroup?.entries ?? [];

  const monthLabel = useMemo(
    () =>
      visibleMonthDate.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      }),
    [locale, visibleMonthDate]
  );

  const monthDays = useMemo(
    () => buildMonthDays(visibleMonthDate, dayGroups),
    [dayGroups, visibleMonthDate]
  );

  useEffect(() => {
    if (initialSheetEvaluated) return;
    if (!initialized) return;
    if (selectedEntries.length > 0) {
      setSheetMode("list");
      setSheetIndex(0);
      sheetRef.current?.snapToIndex?.(0);
    } else {
      sheetRef.current?.close?.();
      setSheetIndex(-1);
    }
    setInitialSheetEvaluated(true);
  }, [initialSheetEvaluated, initialized, selectedEntries.length]);

  const handleSelect = useCallback((activity: Activity) => {
    setSelected(activity);
    setSelectedId(activity.id);
    setSheetMode("details");
    setSheetIndex(0);
    sheetRef.current?.snapToIndex?.(0);
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close?.();
    setSheetIndex(-1);
    setSheetMode("list");
    setSelected(null);
    setSelectedId(null);
  }, []);

  const handleSelectDay = useCallback(
    (day: string) => {
      dispatch(calendarActions.setSelectedDate(day));
      dispatch(calendarActions.setVisibleMonth(day));
      setSelected(null);
      setSelectedId(null);
      setSheetMode("list");
      const nextGroup = dayGroups.find((g) => g.key === day);
      if (nextGroup?.entries.length) {
        setSheetIndex(0);
        sheetRef.current?.snapToIndex?.(0);
      } else {
        sheetRef.current?.close?.();
        setSheetIndex(-1);
      }
    },
    [dayGroups, dispatch]
  );

  const handleToggleFavorite = useCallback(
    (activity: Activity) => {
      const isFav = favoriteIds.includes(activity.id);
      if (isFav) {
        dispatch(removeFavorite(activity.id));
      } else {
        dispatch(addFavorite(activity.id));
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
    [confirm, dispatch, handleClose, t]
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

  const formatDayHeader = useCallback(
    (date: Date) => {
      const weekday = date.toLocaleDateString(locale, { weekday: "long" });
      const full = date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
      });
      return `${weekday} · ${full}`;
    },
    [locale]
  );

  return (
    <Screen
      loading={loading && !initialized}
      headerTitle={t("activities:calendar.title")}
      flushBottom
    >
      <MonthNavigator
        label={monthLabel}
        subtitle={formatDayHeader(visibleMonthDate)}
        onPrev={() => dispatch(calendarActions.goToPreviousMonth())}
        onNext={() => dispatch(calendarActions.goToNextMonth())}
      />

      <DayGrid
        days={monthDays}
        selectedDate={selectedDate}
        todayKey={todayKey}
        locale={locale}
        onSelectDay={handleSelectDay}
      />

      <AppBottomSheet
        ref={sheetRef}
        index={sheetIndex}
        onClose={handleClose}
        snapPoints={snapPoints}
      >
        {sheetMode === "list" ? (
          <SelectedDayActivitiesSheet
            dateLabel={formatDayHeader(selectedDateObj)}
            subtitle={formatDisplayDate(selectedDateObj)}
            entries={selectedEntries}
            favoriteIds={favoriteIds}
            emptyLabel={t("activities:calendar.noActivitiesForDay")}
            onSelectActivity={handleSelect}
            tabBarHeight={tabBarHeight}
          />
        ) : (
          <ActivityDetailsSheet
            activity={effectiveSelected}
            isFavorite={
              effectiveSelected
                ? favoriteIds.includes(effectiveSelected.id)
                : false
            }
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onOpenMaps={(activity) => openActivityInMaps(activity)}
            onOpenSource={(activity) => openActivitySource(activity)}
            onAddToCalendar={handleAddToCalendar}
            onChangePlannedDate={handleSetPlannedDate}
            tabBarHeight={tabBarHeight}
          />
        )}
      </AppBottomSheet>
    </Screen>
  );
};

export default CalendarScreen;
