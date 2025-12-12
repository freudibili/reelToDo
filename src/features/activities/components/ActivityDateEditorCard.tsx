import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import InfoRow from "./InfoRow";
import SuggestionPill from "./SuggestionPill";
import type { Activity } from "../utils/types";
import { resolveDateAction, type DateStatusMeta } from "../utils/dateEditor";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  getOfficialDateValue,
  parseDateValue,
} from "../utils/activityDisplay";

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
  const officialDateValue = getOfficialDateValue(activity);
  const officialDate = useMemo(
    () => parseDateValue(officialDateValue),
    [officialDateValue],
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
    return formatDisplayDateTime(date) ?? formatDisplayDate(date) ?? date.toDateString();
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
    [activity, draftDate, isOwner],
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
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              {status.helper}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status.label}</Text>
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

      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor: saving || !canSave ? colors.overlay : colors.primary,
              borderColor: colors.primaryBorder,
            },
          ]}
          onPress={onSave}
          disabled={saving || !canSave}
        >
          <Text
            style={[
              styles.primaryText,
              {
                color: saving
                  ? colors.secondaryText
                  : mode === "dark"
                    ? colors.text
                    : colors.surface,
              },
            ]}
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
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.2,
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
  primaryText: {
    fontSize: 14,
    fontWeight: "800",
  },
});

export default ActivityDateEditorCard;
