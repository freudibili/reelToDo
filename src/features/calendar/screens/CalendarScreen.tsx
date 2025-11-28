import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
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
  getPrimaryDateValue,
  parseDateValue,
} from "@features/activities/utils/activityDisplay";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import MonthNavigator from "../components/MonthNavigator";
import DayGrid from "../components/DayGrid";
import DayActivitiesList from "../components/DayActivitiesList";
import LocationChangeModal from "@common/components/LocationChangeModal";
import type { PlaceDetails } from "@features/import/services/locationService";
import { ActivitiesService } from "@features/activities/services/activitiesService";

type DayGroup = {
  key: string;
  date: Date;
  activities: Activity[];
};

const buildDayGroups = (activities: Activity[]): DayGroup[] => {
  const groups: Record<string, DayGroup> = {};
  activities.forEach((activity) => {
    const parsed = parseDateValue(getPrimaryDateValue(activity));
    if (!parsed) return;
    const key = toDayKey(parsed);
    if (!groups[key]) {
      groups[key] = { key, date: parsed, activities: [] };
    }
    groups[key].activities.push(activity);
  });

  return Object.values(groups)
    .map((group) => ({
      ...group,
      activities: group.activities.sort((a, b) => {
        const aDate =
          parseDateValue(getPrimaryDateValue(a))?.getTime() ?? 0;
        const bDate =
          parseDateValue(getPrimaryDateValue(b))?.getTime() ?? 0;
        return aDate - bDate;
      }),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalActivity, setLocationModalActivity] =
    useState<Activity | null>(null);
  const [locationSubmitting, setLocationSubmitting] = useState(false);

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
  const selectedActivities = selectedGroup?.activities ?? [];
  const isSelectedToday = selectedDate === todayKey;

  const monthLabel = useMemo(
    () =>
      visibleMonthDate.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      }),
    [locale, visibleMonthDate]
  );

  const monthDays = useMemo(() => {
    const days: { key: string; date: Date; hasActivity: boolean }[] = [];
    const activityKeys = new Set(dayGroups.map((g) => g.key));
    const month = visibleMonthDate.getMonth();
    const year = visibleMonthDate.getFullYear();
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i += 1) {
      const date = new Date(year, month, i);
      const key = toDayKey(date);
      days.push({ key, date, hasActivity: activityKeys.has(key) });
    }
    return days;
  }, [dayGroups, visibleMonthDate]);

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

  const handleOpenLocationModal = useCallback((activity: Activity) => {
    setLocationModalActivity(activity);
    setLocationModalVisible(true);
  }, []);

  const handleCloseLocationModal = useCallback(() => {
    setLocationModalVisible(false);
    setLocationModalActivity(null);
  }, []);

  const handleSubmitLocation = useCallback(
    async (place: PlaceDetails) => {
      if (!locationModalActivity) return;
      setLocationSubmitting(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: locationModalActivity.id,
          userId,
          place,
          note: null,
        });
        Alert.alert(
          t("activities:report.successTitle"),
          t("activities:report.successMessage")
        );
        handleCloseLocationModal();
      } catch (e) {
        Alert.alert(
          t("activities:report.errorTitle"),
          t("activities:report.errorMessage")
        );
      } finally {
        setLocationSubmitting(false);
      }
    },
    [handleCloseLocationModal, locationModalActivity, t, userId]
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
        activities={selectedActivities}
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
            onChangeLocation={handleOpenLocationModal}
          />
        </AppBottomSheet>
      ) : null}

      <LocationChangeModal
        visible={locationModalVisible && !!locationModalActivity}
        onClose={handleCloseLocationModal}
        onSelectPlace={handleSubmitLocation}
        submitting={locationSubmitting}
        initialValue={
          locationModalActivity?.address ?? locationModalActivity?.location_name
        }
        title={t("activities:report.title")}
        subtitle={
          locationModalActivity
            ? t("activities:report.subtitle", {
                title:
                  locationModalActivity.title ??
                  t("common:labels.activity"),
              })
            : undefined
        }
      />
    </Screen>
  );
};

export default CalendarScreen;
