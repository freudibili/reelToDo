import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import {
  Badge,
  Card,
  Stack,
  Text,
  spacing,
} from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import type { Activity } from "@features/activities/types";

import type { CalendarActivityEntry } from "../types";
import DayActivityItem from "./DayActivityItem";
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
  const countLabel = t("activities:calendar.count", { count: rows.length });

  return (
    <Card variant="outlined" padding="lg" style={styles.card}>
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
          {isToday ? <Badge tone="primary">{todayLabel}</Badge> : null}
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
    </Card>
  );
};

export default DayActivitiesList;

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    marginTop: spacing.xs,
  },
});
