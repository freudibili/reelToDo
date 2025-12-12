import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { Text } from "@common/designSystem";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import InfoRow from "./InfoRow";
import SuggestionPill from "./SuggestionPill";
import type { Activity } from "../types";
import { resolveDateAction, type DateStatusMeta } from "../utils/dateEditor";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatActivityDateValue,
  getActivityDateValues,
  getOfficialDateValue,
  parseDateValue,
} from "../utils/activityDisplay";
import AdditionalInfoList from "./AdditionalInfoList";

type ActivityDateEditorCardProps = {
  activity: Activity;
  status: DateStatusMeta;
  draftDate: Date | null;
  onChangeDate: (date: Date) => void;
  onRequestChange?: () => void;
  onSave: () => void;
  saving: boolean;
  isOwner: boolean;
};

const ActivityDateEditorCard: React.FC<ActivityDateEditorCardProps> = ({
  activity,
  status,
  draftDate,
  onChangeDate,
  onRequestChange,
  onSave,
  saving,
  isOwner,
}) => {
  const { colors, mode } = useAppTheme();
  const { t } = useTranslation();
  const contrastColor = colors.favoriteContrast;
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

  const statusColor =
    status.tone === "success"
      ? colors.success
      : status.tone === "warning"
        ? colors.danger
        : colors.accent;
  const action = useMemo(
    () => resolveDateAction({ activity, isOwner, draftDate }),
    [activity, draftDate, isOwner]
  );
  const primaryLabel = saving
    ? t("common:locationPicker.submitting")
    : action === "continue"
      ? t("common:buttons.continue")
      : action === "save"
        ? t("activities:editor.saveDate")
        : t("activities:editor.suggestDate");

  const canSave = action === "continue" ? true : !!effectiveDate;

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
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusColor, shadowColor: colors.text },
            ]}
          >
            <Text
              variant="caption"
              weight="700"
              style={{ color: contrastColor }}
            >
              {status.label}
            </Text>
          </View>
        </View>
      ) : null}

      <InfoRow
        icon="calendar"
        value={dateLabel}
        rightSlot={
          <SuggestionPill
            onPress={onRequestChange ?? openPicker}
            label={t("activities:editor.changeDate")}
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

      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                saving || !canSave ? colors.overlay : colors.primary,
              borderColor: colors.primaryBorder,
            },
          ]}
          onPress={onSave}
          disabled={saving || !canSave}
        >
          <Text
            variant="bodyStrong"
            style={{
              color: saving ? colors.secondaryText : contrastColor,
            }}
          >
            {primaryLabel}
          </Text>
        </Pressable>
      </View>

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
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActivityDateEditorCard;
