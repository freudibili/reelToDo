import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { Badge, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import AdditionalInfoList from "./AdditionalInfoList";
import InfoRow from "./InfoRow";
import SuggestionPill from "./SuggestionPill";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import type { Activity } from "../types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatActivityDateValue,
  getActivityDateValues,
  getOfficialDateValue,
  parseDateValue,
} from "../utils/activityDisplay";
import type { DateStatusMeta } from "../utils/dateEditor";

type ActivityDateEditorCardProps = {
  activity: Activity;
  status: DateStatusMeta;
  draftDate: Date | null;
  onChangeDate: (date: Date) => void;
  onRequestChange?: () => void;
  isOwner: boolean;
};

const ActivityDateEditorCard: React.FC<ActivityDateEditorCardProps> = ({
  activity,
  status,
  draftDate,
  onChangeDate,
  onRequestChange,
  isOwner,
}) => {
  const { colors, mode } = useAppTheme();
  const { t } = useTranslation();
  const officialDateValue = getOfficialDateValue(activity);
  const officialDate = useMemo(
    () => parseDateValue(officialDateValue),
    [officialDateValue]
  );
  const dateValues = useMemo(() => getActivityDateValues(activity), [activity]);
  const formattedOfficialDates = useMemo(
    () =>
      dateValues
        .map((value) => formatActivityDateValue(value))
        .filter((value): value is string => Boolean(value)),
    [dateValues]
  );
  const additionalDates = useMemo(
    () => formattedOfficialDates.slice(1),
    [formattedOfficialDates]
  );
  const effectiveDate = draftDate ?? officialDate;
  const baseDate = effectiveDate ?? new Date();
  const { openPicker, pickerModal } = usePlatformDateTimePicker({
    value: baseDate,
    onChange: onChangeDate,
    cardColor: colors.card,
    themeMode: mode,
    textColor: colors.text,
  });

  const dateLabel = useMemo(() => {
    const date = effectiveDate;
    if (!date) return t("activities:details.dateMissing");
    return (
      formatDisplayDateTime(date) ??
      formatDisplayDate(date) ??
      date.toDateString()
    );
  }, [effectiveDate, t]);

  const title = status.needsConfirmation
    ? t("activities:details.dateFallback")
    : t("activities:editor.dateConfirmedTitle");

  const statusTone =
    status.tone === "success"
      ? "success"
      : status.tone === "warning"
        ? "danger"
        : "accent";
  return (
    <View style={styles.container}>
      {isOwner ? (
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text variant="title3" style={{ color: colors.text }}>
              {title}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {status.helper}
            </Text>
          </View>
          <Badge tone={statusTone}>{status.label}</Badge>
        </View>
      ) : null}

      <InfoRow
        icon="calendar"
        value={dateLabel}
        rightSlot={
          <SuggestionPill
            onPress={onRequestChange ?? openPicker}
            label={isOwner ? t("activities:editor.changeDate") : undefined}
          />
        }
      />
      {additionalDates.length > 0 ? (
        <AdditionalInfoList
          title={t("activities:details.otherDates")}
          icon="calendar-range-outline"
          items={additionalDates}
        />
      ) : null}

      {onRequestChange ? null : pickerModal}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
});

export default ActivityDateEditorCard;
