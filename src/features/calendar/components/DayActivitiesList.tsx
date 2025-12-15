import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Badge, Stack, Text, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import type { Activity } from "@features/activities/types";

import type { CalendarActivityEntry } from "../types";
import DayActivityItem from "./DayActivityItem";
import { buildDayActivityViews } from "../utils/dayActivityView";

interface Props {
  dateLabel: string;
  subtitle: string | null;
  entries: CalendarActivityEntry[];
  favoriteIds: string[];
  emptyLabel: string;
  onSelectActivity: (activity: Activity) => void;
}

const DayActivitiesList: React.FC<Props> = ({
  dateLabel,
  subtitle,
  entries,
  favoriteIds,
  emptyLabel,
  onSelectActivity,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const rows = buildDayActivityViews(entries, favoriteIds, t, colors);
  const countLabel = t("activities:calendar.count", { count: rows.length });

  return (
    <View style={styles.container}>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        style={styles.header}
      >
        <Stack gap="xxs">
          <Text variant="title3">{dateLabel}</Text>
          {subtitle ? (
            <Text variant="caption" tone="subtle">
              {subtitle}
            </Text>
          ) : null}
        </Stack>

        <Stack direction="row" align="center" gap="xs">
          <Badge tone="neutral">{countLabel}</Badge>
        </Stack>
      </Stack>

      {rows.length === 0 ? (
        <Text variant="body" tone="subtle" style={styles.emptySubtitle}>
          {emptyLabel}
        </Text>
      ) : (
        <Stack gap="sm">
          {rows.map((row, idx) => (
            <DayActivityItem
              key={row.id}
              item={row}
              isLast={idx === rows.length - 1}
              onSelect={(item) => onSelectActivity(item.activity)}
            />
          ))}
        </Stack>
      )}
    </View>
  );
};

export default DayActivitiesList;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
    width: "95%",
  },
  emptySubtitle: {
    marginTop: spacing.xs,
  },
});
