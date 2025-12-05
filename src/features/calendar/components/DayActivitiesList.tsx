import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";
import type { Activity } from "@features/activities/utils/types";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import type { CalendarActivityEntry } from "../types";
import { buildDayActivityViews } from "../utils/dayActivityView";

interface Props {
  dateLabel: string;
  subtitle: string | null;
  isToday: boolean;
  entries: CalendarActivityEntry[];
  favoriteIds: string[];
  emptyLabel: string;
  onSelectActivity: (activity: Activity) => void;
  todayLabel: string;
}

const DayActivitiesList: React.FC<Props> = ({
  dateLabel,
  subtitle,
  isToday,
  entries,
  favoriteIds,
  emptyLabel,
  onSelectActivity,
  todayLabel,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const rows = buildDayActivityViews(entries, favoriteIds, t, colors);

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
              style={[styles.todayBadge, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.todayBadgeText, { color: colors.background }]}
              >
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
              {rows.length}
            </Text>
          </View>
        </View>
      </View>

      {rows.length === 0 ? (
        <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
          {emptyLabel}
        </Text>
      ) : (
        rows.map((row, idx) => {
          const isLast = idx === rows.length - 1;
          return (
            <Pressable
              key={row.id}
              style={styles.activityRow}
              onPress={() => onSelectActivity(row.activity)}
            >
              <View style={styles.timelineColumn}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: row.timelineColor,
                      borderColor: row.timelineBorderColor,
                    },
                  ]}
                />
                {!isLast ? (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: row.timelineColor },
                    ]}
                  />
                ) : null}
              </View>

              <View
                style={[
                  styles.cardBody,
                  {
                    backgroundColor: colors.surface,
                    borderColor: row.cardBorderColor,
                    shadowColor: row.shadowColor,
                  },
                ]}
              >
                <View style={styles.rowHeader}>
                  <Text
                    style={[styles.activityTitle, { color: colors.text }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {row.title}
                  </Text>
                  {row.isFavorite ? (
                    <Icon source="heart" size={14} color={colors.favorite} />
                  ) : null}
                </View>

                <View style={styles.metaRow}>
                  <Icon
                    source={row.iconName}
                    size={14}
                    color={row.timelineColor}
                  />
                  <Text
                    style={[styles.metaText, { color: colors.secondaryText }]}
                  >
                    {row.mainLabel}
                  </Text>
                </View>
                {row.officialLabel ? (
                  <Text
                    style={[styles.metaTextMuted, { color: colors.mutedText }]}
                  >
                    {t("activities:planned.officialLabel", {
                      value: row.officialLabel,
                    })}
                  </Text>
                ) : null}
                {row.plannedLabel ? (
                  <Text
                    style={[styles.metaTextMuted, { color: colors.mutedText }]}
                  >
                    {row.plannedLabel}
                  </Text>
                ) : null}
                {row.locationLabel ? (
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
                      {row.locationLabel}
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
