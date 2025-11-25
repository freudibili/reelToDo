import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";
import type { Activity } from "@features/activities/utils/types";
import {
  formatActivityLocation,
  formatDisplayDateTime,
  getPrimaryDateValue,
  formatDisplayTime,
  hasTimeComponent,
  isSameDateValue,
} from "@features/activities/utils/activityDisplay";
import { useTranslation } from "react-i18next";

interface Props {
  dateLabel: string;
  subtitle: string | null;
  isToday: boolean;
  activities: Activity[];
  favoriteIds: string[];
  emptyLabel: string;
  onSelectActivity: (activity: Activity) => void;
  todayLabel: string;
}

const DayActivitiesList: React.FC<Props> = ({
  dateLabel,
  subtitle,
  isToday,
  activities,
  favoriteIds,
  emptyLabel,
  onSelectActivity,
  todayLabel,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayLabel}>{dateLabel}</Text>
          {subtitle ? <Text style={styles.daySubLabel}>{subtitle}</Text> : null}
        </View>
        <View style={styles.dayRight}>
          {isToday ? (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>{todayLabel}</Text>
            </View>
          ) : null}
          <View style={styles.countPill}>
            <Text style={styles.countText}>{activities.length}</Text>
          </View>
        </View>
      </View>

      {activities.length === 0 ? (
        <Text style={styles.emptySubtitle}>{emptyLabel}</Text>
      ) : (
        activities.map((activity, idx) => {
          const primaryDate = getPrimaryDateValue(activity);
          const timeLabel =
            formatDisplayTime(primaryDate) ??
            t("activities:calendar.allDay");
          const locationLabel = formatActivityLocation(activity);
          const showTime = hasTimeComponent(primaryDate);
          const isPlanned = Boolean(activity.planned_at);
          const officialLabel =
            isPlanned &&
            activity.main_date &&
            !isSameDateValue(activity.main_date, primaryDate)
              ? formatDisplayDateTime(activity.main_date)
              : null;
          const iconName = isPlanned
            ? "calendar-check"
            : showTime
              ? "clock-outline"
              : "calendar-blank";
          const isFavorite = favoriteIds.includes(activity.id);
          const isLast = idx === activities.length - 1;

          const title = activity.title || t("activities:card.untitled");

          return (
            <Pressable
              key={activity.id}
              style={styles.activityRow}
              onPress={() => onSelectActivity(activity)}
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
                    {title}
                  </Text>
                  {isFavorite ? <Text style={styles.favoriteTag}>★</Text> : null}
                </View>

                <View style={styles.metaRow}>
                  <Icon
                    source={iconName}
                    size={14}
                    color="#0f172a"
                  />
                  <Text style={styles.metaText}>
                    {isPlanned
                      ? t("activities:planned.timeLabel", {
                          value: timeLabel,
                        })
                      : timeLabel}
                  </Text>
                </View>
                {officialLabel ? (
                  <Text style={styles.metaTextMuted}>
                    {t("activities:planned.officialLabel", {
                      value: officialLabel,
                    })}
                  </Text>
                ) : null}
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
        })
      )}
    </View>
  );
};

export default DayActivitiesList;

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
  dayRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBadge: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  metaTextMuted: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#475569",
  },
});
