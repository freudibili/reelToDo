import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import DateBadge from "./DateBadge";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { getDateVisuals } from "@features/activities/utils/dateVisuals";

interface ActivitySummaryHeaderProps {
  title: string;
  category?: string | null;
  location?: string | null;
  dateLabel?: string | null;
  plannedDateLabel?: string | null;
  officialDateLabel?: string | null;
  style?: ViewStyle;
}

const ActivitySummaryHeader: React.FC<ActivitySummaryHeaderProps> = ({
  title,
  category,
  location,
  dateLabel,
  plannedDateLabel,
  officialDateLabel,
  style,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const displayTitle = title || t("labels.activity");
  const metaLine = [
    category ? formatCategoryName(category) : null,
    location,
  ]
    .filter(Boolean)
    .join(" • ");

  const badges = [
    plannedDateLabel
      ? {
          label: plannedDateLabel,
          visuals: getDateVisuals(colors, "planned"),
        }
      : null,
    officialDateLabel && officialDateLabel !== plannedDateLabel
      ? {
          label: officialDateLabel,
          visuals: getDateVisuals(colors, "official"),
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    visuals: { icon: string; color: string; background: string };
  }[];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {displayTitle}
      </Text>
      {metaLine ? (
        <Text style={[styles.meta, { color: colors.secondaryText }]} numberOfLines={2}>
          {metaLine}
        </Text>
      ) : null}
      {badges.length > 0 ? (
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <DateBadge
              key={`${badge.label}-${badge.visuals.icon}`}
              label={badge.label}
              icon={badge.visuals.icon}
              iconColor={badge.visuals.color}
              iconBackgroundColor={badge.visuals.background}
              labelWeight="normal"
            />
          ))}
        </View>
      ) : (
        <DateBadge label={dateLabel} />
      )}
    </View>
  );
};

export default ActivitySummaryHeader;

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  meta: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
});
