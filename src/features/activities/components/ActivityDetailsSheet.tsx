import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { IconButton } from "react-native-paper";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import ActionRail, { type ActionRailItem } from "@common/components/ActionRail";
import {
  formatActivityLocation,
  formatDisplayDate,
  formatDisplayDateTime,
  getPrimaryDateValue,
  isSameDateValue,
} from "../utils/activityDisplay";
import { categoryNeedsDate } from "../utils/activityHelper";
import type { Activity } from "../utils/types";
import { useTranslation } from "react-i18next";
import InfoRow from "./InfoRow";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";

interface Props {
  activity: Activity | null;
  isFavorite: boolean;
  onDelete: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  onOpenMaps: (activity: Activity) => void;
  onOpenSource: (activity: Activity) => void;
  onAddToCalendar: (activity: Activity) => void;
  onChangePlannedDate: (activity: Activity, date: Date | null) => void;
}

const ActivityDetailsSheet: React.FC<Props> = ({
  activity,
  isFavorite,
  onDelete,
  onToggleFavorite,
  onOpenMaps,
  onOpenSource,
  onAddToCalendar,
  onChangePlannedDate,
}) => {
  const { t } = useTranslation();
  const { confirm } = useConfirmDialog();
  const [pickerVisible, setPickerVisible] = useState(false);
  if (!activity) return null;

  const officialDateLabel = formatDisplayDate(activity.main_date);
  const plannedDateLabel = formatDisplayDateTime(activity.planned_at);
  const primaryDateLabel = formatDisplayDateTime(
    getPrimaryDateValue(activity)
  );
  const locationLabel =
    formatActivityLocation(activity) ??
    t("activities:details.locationFallback");
  const needsDate = categoryNeedsDate(activity.category);
  const sameAsOfficial = isSameDateValue(
    activity.planned_at,
    activity.main_date
  );
  const primaryDateValue = getPrimaryDateValue(activity);
  const hasDateForCalendar =
    !!primaryDateValue &&
    !Number.isNaN(new Date(primaryDateValue).getTime());

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selected?: Date
  ) => {
    setPickerVisible(false);
    if (!selected) return;
    onChangePlannedDate(activity, selected);
  };

  const planActionLabel = plannedDateLabel
    ? t("activities:planned.ctaEdit")
    : t("activities:planned.ctaAdd");

  const handleAddToCalendar = () =>
    confirm(
      t("activities:calendarSync.title"),
      t("activities:calendarSync.message"),
      () => onAddToCalendar(activity),
      {
        cancelText: t("activities:calendarSync.cancel"),
        confirmText: t("activities:calendarSync.confirm"),
      }
    );

  const actions: ActionRailItem[] = [
    {
      key: "plan",
      label: planActionLabel,
      icon: plannedDateLabel ? "calendar-edit" : "calendar-plus",
      onPress: () => setPickerVisible(true),
    },
    {
      key: "maps",
      label: t("activities:details.actions.maps"),
      icon: "map-marker",
      onPress: () => onOpenMaps(activity),
    },
    ...(hasDateForCalendar
      ? [
          {
            key: "calendar",
            label: t("activities:details.actions.calendar"),
            icon: "calendar",
            onPress: handleAddToCalendar,
          } as ActionRailItem,
        ]
      : []),
    {
      key: "favorite",
      label: t("activities:details.actions.favorite"),
      icon: isFavorite ? "heart" : "heart-outline",
      onPress: () => onToggleFavorite(activity),
    },
    {
      key: "source",
      label: t("activities:details.actions.source"),
      icon: "link-variant",
      onPress: () => onOpenSource(activity),
      disabled: !activity.source_url,
    },
    {
      key: "delete",
      label: t("activities:details.actions.delete"),
      icon: "delete-outline",
      tone: "danger" as const,
      onPress: () => onDelete(activity),
    },
  ];

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled
    >
      <ActivitySummaryHeader
        title={activity.title ?? t("common:labels.activity")}
        category={activity.category}
        location={locationLabel}
        dateLabel={primaryDateLabel ?? officialDateLabel}
        style={styles.headerBlock}
      />

      <View style={styles.actionsRailWrapper}>
        <ActionRail actions={actions} />
      </View>

      {pickerVisible ? (
        <DateTimePicker
          value={
            activity.planned_at
              ? new Date(activity.planned_at)
              : activity.main_date
                ? new Date(activity.main_date)
                : new Date()
          }
          mode={Platform.OS === "ios" ? "datetime" : "date"}
          onChange={handleDateChange}
        />
      ) : null}

      <ActivityHero
        title={activity.title ?? t("common:labels.activity")}
        category={activity.category}
        location={locationLabel}
        dateLabel={primaryDateLabel}
        imageUrl={activity.image_url}
        showOverlayContent={false}
      />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          {t("activities:details.overview")}
        </Text>
        <View style={styles.sectionUnderline} />
      </View>
      <InfoRow
        icon="map-marker"
        value={activity.address ?? t("activities:details.addressMissing")}
      />
      {needsDate ? (
        <InfoRow
          icon="calendar"
          value={officialDateLabel ?? t("activities:details.dateMissing")}
        />
      ) : null}
      <Pressable style={styles.planCard} onPress={() => setPickerVisible(true)}>
        <View style={styles.planTextCol}>
          <Text style={styles.sectionHeaderText}>
            {t("activities:planned.title")}
          </Text>
          <Text style={styles.subtle}>
            {plannedDateLabel ?? t("activities:planned.empty")}
          </Text>
          {activity.main_date ? (
            <Text style={styles.muted}>
              {sameAsOfficial
                ? t("activities:planned.matchesOfficial")
                : t("activities:planned.officialLabel", {
                    value: formatDisplayDateTime(activity.main_date),
                  })}
            </Text>
          ) : null}
        </View>
        <View style={styles.planActions}>
          <IconButton
            mode="contained-tonal"
            icon={plannedDateLabel ? "pencil" : "calendar-plus"}
            onPress={() => setPickerVisible(true)}
            containerColor="#e2e8f0"
            iconColor="#0f172a"
            size={22}
            style={styles.iconButton}
          />
          {plannedDateLabel ? (
            <IconButton
              mode="contained-tonal"
              icon="close"
              onPress={() => onChangePlannedDate(activity, null)}
              containerColor="#e2e8f0"
              iconColor="#0f172a"
              size={22}
              style={styles.iconButton}
            />
          ) : null}
        </View>
      </Pressable>
    </BottomSheetScrollView>
  );
};

export default ActivityDetailsSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 18,
    gap: 10,
  },
  headerBlock: {
    paddingHorizontal: 4,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 2,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 70,
    backgroundColor: "#0f172a",
    borderRadius: 999,
  },
  planCard: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planTextCol: {
    flex: 1,
    gap: 4,
  },
  planActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    margin: 0,
  },
  subtle: {
    fontSize: 12,
    color: "#475569",
  },
  muted: {
    fontSize: 12,
    color: "#94a3b8",
  },
  link: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  actionsRailWrapper: {
    marginTop: 6,
  },
});
