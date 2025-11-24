import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";
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
  createActivityCalendarEvent,
  deleteActivity,
  fetchActivities,
  openActivityInMaps,
  openActivitySource,
  removeFavorite,
  startActivitiesListener,
  stopActivitiesListener,
} from "@features/activities/store/activitiesSlice";
import type { Activity } from "@features/activities/utils/types";
import {
  formatActivityLocation,
  formatDisplayDate,
  formatDisplayTime,
  hasTimeComponent,
  parseDateValue,
} from "@features/activities/utils/activityDisplay";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import MonthNavigator from "../components/MonthNavigator";
import DayGrid from "../components/DayGrid";
import DayActivitiesList from "../components/DayActivitiesList";

type DayGroup = {
  key: string;
  date: Date;
  activities: Activity[];
};

const buildDayGroups = (activities: Activity[]): DayGroup[] => {
  const groups: Record<string, DayGroup> = {};
  activities.forEach((activity) => {
    const parsed = parseDateValue(activity.main_date);
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
        const aDate = parseDateValue(a.main_date)?.getTime() ?? 0;
        const bDate = parseDateValue(b.main_date)?.getTime() ?? 0;
        return aDate - bDate;
      }),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

const CalendarScreen = () => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const { t, i18n } = useTranslation();
  const activities = useAppSelector(activitiesSelectors.items);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const selectedDate = useAppSelector(calendarSelectors.selectedDate);
  const visibleMonthDate = useAppSelector(calendarSelectors.visibleMonthDate);
  const monthPrefix = useAppSelector(calendarSelectors.monthPrefix);

  const locale = useMemo(
    () => (i18n.resolvedLanguage === "fr" ? "fr-FR" : "en-US"),
    [i18n.resolvedLanguage]
  );
  const [selected, setSelected] = useState<Activity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["35%", "70%"], []);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener());
    dispatch(calendarActions.setSelectedDate(toDayKey(new Date())));
    dispatch(calendarActions.setVisibleMonth(toDayKey(new Date())));
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch]);

  const dayGroups = useMemo(() => buildDayGroups(activities), [activities]);
  const undatedActivities = useMemo(
    () => activities.filter((a) => !parseDateValue(a.main_date)),
    [activities]
  );

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
    setSheetVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    setSelected(null);
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

      {undatedActivities.length ? (
        <View style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.dayLabel}>
                {t("activities:calendar.undatedTitle")}
              </Text>
              <Text style={styles.daySubLabel}>
                {t("activities:calendar.undatedSubtitle")}
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>
                {t("activities:calendar.count", {
                  count: undatedActivities.length,
                })}
              </Text>
            </View>
          </View>

          {undatedActivities.map((activity, idx) => {
            const locationLabel = formatActivityLocation(activity);
            const isFavorite = favoriteIds.includes(activity.id);
            const isLast = idx === undatedActivities.length - 1;

            return (
              <Pressable
                key={activity.id}
                style={styles.activityRow}
                onPress={() => handleSelect(activity)}
              >
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.timelineDot,
                      isFavorite && styles.timelineDotFavorite,
                    ]}
                  />
                  {!isLast ? <View style={styles.timelineLine} /> : null}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.rowHeader}>
                    <Text
                      style={styles.activityTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {activity.title ?? t("activities:card.untitled")}
                    </Text>
                    {isFavorite ? (
                      <Text style={styles.favoriteTag}>★</Text>
                    ) : null}
                  </View>

                  <View style={styles.metaRow}>
                    <Icon
                      source="calendar-remove"
                      size={14}
                      color="#0f172a"
                    />
                    <Text style={styles.metaText}>
                      {t("activities:calendar.noDate")}
                    </Text>
                  </View>
                  {locationLabel ? (
                    <View style={styles.metaRow}>
                      <Icon
                        source="map-marker-outline"
                        size={14}
                        color="#0f172a"
                      />
                      <Text
                        style={styles.metaText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {locationLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {sheetVisible ? (
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
            onToggleFavorite={handleToggleFavorite}
            onOpenMaps={(activity) => dispatch(openActivityInMaps(activity.id))}
            onOpenSource={(activity) =>
              dispatch(openActivitySource(activity.id))
            }
            onAddToCalendar={handleAddToCalendar}
          />
        </AppBottomSheet>
      ) : null}
    </Screen>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  dayCard: {
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  daySubLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#475569",
  },
  countPill: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  activityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  timelineColumn: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
    borderWidth: 2,
    borderColor: "#fff",
    marginTop: 2,
  },
  timelineDotFavorite: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0f172a",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#e2e8f0",
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 6,
  },
  activityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  favoriteTag: {
    color: "#f59e0b",
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: "#475569",
    flexShrink: 1,
  },
});
