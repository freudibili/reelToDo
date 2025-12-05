import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import ActivityDetailsSheet from "@features/activities/components/ActivityDetailsSheet";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
import { calendarSelectors } from "@features/calendar/store/calendarSelectors";
import { calendarActions } from "@features/calendar/store/calendarSlice";
import { toDayKey } from "@features/calendar/utils/dates";
import {
  addFavorite,
  deleteActivity,
  fetchActivities,
  setPlannedDate,
  removeFavorite,
  startActivitiesListener,
  stopActivitiesListener,
} from "@features/activities/store/activitiesSlice";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";
import {
  openActivityInMaps,
  openActivitySource,
} from "@features/activities/services/linksService";
import type { Activity } from "@features/activities/utils/types";
import {
  formatDisplayDate,
} from "@features/activities/utils/activityDisplay";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import MonthNavigator from "../components/MonthNavigator";
import DayGrid from "../components/DayGrid";
import DayActivitiesList from "../components/DayActivitiesList";
import type { DayGroup } from "../types";
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
  const [sheetVisible, setSheetVisible] = useState(false);
  const effectiveSelected = selectedFromStore ?? selected;
  const sheetRef = useRef(null);

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
  const isSelectedToday = selectedDate === todayKey;

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

  const handleSelect = useCallback((activity: Activity) => {
    setSelected(activity);
    setSelectedId(activity.id);
    setSheetVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    setSelected(null);
    setSelectedId(null);
  }, []);

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
      scrollable
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
        onSelectDay={(day) => {
          dispatch(calendarActions.setSelectedDate(day));
          dispatch(calendarActions.setVisibleMonth(day));
        }}
      />

      <DayActivitiesList
        dateLabel={formatDayHeader(selectedDateObj)}
        subtitle={formatDisplayDate(selectedDateObj)}
        isToday={isSelectedToday}
        entries={selectedEntries}
        favoriteIds={favoriteIds}
        emptyLabel={t("activities:calendar.noActivitiesForDay")}
        todayLabel={t("activities:calendar.today")}
        onSelectActivity={handleSelect}
      />

      {sheetVisible ? (
        <AppBottomSheet
          ref={sheetRef}
          index={1}
          onClose={handleClose}
          scrollable
        >
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
          />
        </AppBottomSheet>
      ) : null}
    </Screen>
  );
};

export default CalendarScreen;
