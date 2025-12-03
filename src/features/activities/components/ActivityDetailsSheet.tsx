import React, { useMemo, useState, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import ActionRail, { type ActionRailItem } from "@common/components/ActionRail";
import DateBadge from "@common/components/DateBadge";
import {
  formatActivityLocation,
  formatDisplayDate,
  formatDisplayDateTime,
  getOfficialDateValue,
  getPrimaryDateValue,
  isSameDateValue,
} from "../utils/activityDisplay";
import { categoryNeedsDate } from "../utils/activityHelper";
import type { Activity } from "../utils/types";
import { useTranslation } from "react-i18next";
import InfoRow from "./InfoRow";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import { useAppTheme } from "@common/theme/appTheme";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import LocationAssistButton from "./LocationAssistButton";
import LocationChangeModal from "@common/components/LocationChangeModal";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { ActivitiesService } from "../services/activitiesService";
import type { PlaceDetails } from "@features/import/services/locationService";
import { activityPatched } from "../store/activitiesSlice";

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
  const { colors, mode } = useAppTheme();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSubmitting, setLocationSubmitting] = useState(false);
  if (!activity) return null;
  const officialDateValue = getOfficialDateValue(activity);
  const baseDate = useMemo(
    () =>
      activity.planned_at
        ? new Date(activity.planned_at)
        : officialDateValue
          ? new Date(officialDateValue)
          : new Date(),
    [activity.planned_at, officialDateValue]
  );

  const { openPicker, pickerModal } = usePlatformDateTimePicker({
    value: baseDate,
    onChange: (date) => onChangePlannedDate(activity, date),
    cardColor: colors.card,
  });

  const officialDateLabel = formatDisplayDate(officialDateValue);
  const plannedDateLabel = formatDisplayDateTime(activity.planned_at);
  const primaryDateLabel = formatDisplayDateTime(getPrimaryDateValue(activity));
  const locationLabel =
    formatActivityLocation(activity) ??
    t("activities:details.locationFallback");
  const needsDate = categoryNeedsDate(activity.category);
  const sameAsOfficial = isSameDateValue(activity.planned_at, officialDateValue);
  const primaryDateValue = getPrimaryDateValue(activity);
  const hasDateForCalendar =
    !!primaryDateValue && !Number.isNaN(new Date(primaryDateValue).getTime());

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
      onPress: openPicker,
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
      iconColor: isFavorite ? "#d64545" : undefined,
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

  const handleOpenLocationModal = useCallback(() => {
    setLocationModalVisible(true);
  }, []);

  const handleCloseLocationModal = useCallback(() => {
    setLocationModalVisible(false);
  }, []);

  const handleSubmitLocation = useCallback(
    async (place: PlaceDetails) => {
      if (!activity) return;
      setLocationSubmitting(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: activity.id,
          userId,
          place,
          note: null,
        });
        dispatch(
          activityPatched({
            id: activity.id,
            changes: {
              location_status: "suggested",
              needs_location_confirmation: true,
            },
          })
        );
        Alert.alert(
          t("activities:report.successTitle"),
          t("activities:report.successMessage")
        );
        handleCloseLocationModal();
      } catch (e) {
        Alert.alert(
          t("activities:report.errorTitle"),
          t("activities:report.errorMessage")
        );
      } finally {
        setLocationSubmitting(false);
      }
    },
    [activity, dispatch, handleCloseLocationModal, t, userId]
  );

  return (
    <>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.surface },
        ]}
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

        {pickerModal}

        <ActivityHero
          title={activity.title ?? t("common:labels.activity")}
          category={activity.category}
          location={locationLabel}
          dateLabel={primaryDateLabel}
          imageUrl={activity.image_url}
          showOverlayContent={false}
        />
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
            {t("activities:details.overview")}
          </Text>
          <View
            style={[
              styles.sectionUnderline,
              { backgroundColor: colors.primary },
            ]}
          />
        </View>
        <InfoRow
          icon="map-marker"
          value={activity.address ?? t("activities:details.addressMissing")}
          rightSlot={
            <LocationAssistButton
              activity={activity}
              onChangeLocation={handleOpenLocationModal}
            />
          }
        />
        {needsDate ? (
          <InfoRow
            icon="calendar"
            value={officialDateLabel ?? t("activities:details.dateMissing")}
          />
        ) : null}
        <Pressable
          style={[
            styles.planCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={openPicker}
        >
          <View style={styles.planTextCol}>
            <DateBadge
              label={plannedDateLabel ?? t("activities:planned.empty")}
              tone={plannedDateLabel ? "default" : "muted"}
            />
            {officialDateValue ? (
              <Text style={[styles.muted, { color: colors.mutedText }]}>
                {sameAsOfficial
                  ? t("activities:planned.matchesOfficial")
                  : t("activities:planned.officialLabel", {
                      value: formatDisplayDateTime(officialDateValue),
                    })}
              </Text>
            ) : null}
          </View>
          <View style={styles.planActions}>
            <IconButton
              mode="contained-tonal"
              icon={plannedDateLabel ? "pencil" : "calendar-plus"}
              onPress={openPicker}
              containerColor={colors.accent}
              iconColor="#ffffff"
              size={22}
              style={styles.iconButton}
            />
            {plannedDateLabel ? (
              <IconButton
                mode="contained-tonal"
                icon="trash-can-outline"
                onPress={() => onChangePlannedDate(activity, null)}
                containerColor={colors.accent}
                iconColor="#ffffff"
                size={22}
                style={styles.iconButton}
              />
            ) : null}
          </View>
        </Pressable>
      </BottomSheetScrollView>

      <LocationChangeModal
        visible={locationModalVisible}
        onClose={handleCloseLocationModal}
        onSelectPlace={handleSubmitLocation}
        submitting={locationSubmitting}
        initialValue={activity.address ?? activity.location_name ?? undefined}
        title={t("activities:report.title")}
        subtitle={t("activities:report.subtitle", {
          title: activity.title ?? t("common:labels.activity"),
        })}
      />
    </>
  );
};

export default ActivityDetailsSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 18,
    gap: 10,
    flexGrow: 1,
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
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 70,
    borderRadius: 999,
  },
  planCard: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
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
  },
  muted: {
    fontSize: 12,
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRailWrapper: {
    marginTop: 6,
  },
});
