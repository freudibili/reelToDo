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
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.dayCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.dayHeader}>
        <View>
          <Text style={[styles.dayLabel, { color: colors.text }]}>
            {dateLabel}
          </Text>
          {subtitle ? (
            <Text style={[styles.daySubLabel, { color: colors.secondaryText }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.dayRight}>
          {isToday ? (
            <View
              style={[
                styles.todayBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.todayBadgeText, { color: "#fff" }]}>
                {todayLabel}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.overlay, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.countText, { color: colors.text }]}>
              {activities.length}
            </Text>
          </View>
        </View>
      </View>

      {activities.length === 0 ? (
        <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
          {emptyLabel}
        </Text>
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
                    { backgroundColor: colors.border, borderColor: colors.surface },
                    isFavorite && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                />
                {!isLast ? (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>

              <View
                style={[
                  styles.cardBody,
                  { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary },
                ]}
              >
                <View style={styles.rowHeader}>
                  <Text
                    style={[styles.activityTitle, { color: colors.text }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                  {isFavorite ? (
                    <Text style={[styles.favoriteTag, { color: colors.primary }]}>
                      ★
                    </Text>
                  ) : null}
                </View>

                <View style={styles.metaRow}>
                  <Icon
                    source={iconName}
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                    {isPlanned
                      ? t("activities:planned.timeLabel", {
                          value: timeLabel,
                        })
                      : timeLabel}
                  </Text>
                </View>
                {officialLabel ? (
                  <Text style={[styles.metaTextMuted, { color: colors.mutedText }]}>
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
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.metaText, { color: colors.secondaryText }]}
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
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
    textTransform: "capitalize",
  },
  daySubLabel: {
    marginTop: 2,
    fontSize: 12,
  },
  dayRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  countPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
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
    borderWidth: 2,
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
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
  },
  favoriteTag: {
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
    flexShrink: 1,
  },
  metaTextMuted: {
    fontSize: 12,
    marginTop: 2,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
