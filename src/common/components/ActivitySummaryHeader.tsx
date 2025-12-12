import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { getDateVisuals } from "@features/activities/utils/dateVisuals";
import DateBadge from "./DateBadge";

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
    <Stack gap="xs" style={[styles.container, style]}>
      <Text variant="title2" numberOfLines={2}>
        {displayTitle}
      </Text>
      {metaLine ? (
        <Text variant="body" tone="muted" numberOfLines={2}>
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
    </Stack>
  );
};

export default ActivitySummaryHeader;

const styles = StyleSheet.create({
  container: {
    width: "90%",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
});
