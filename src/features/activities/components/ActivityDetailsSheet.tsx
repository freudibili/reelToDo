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
import DateAssistButton from "./DateAssistButton";
import DateChangeModal from "./DateChangeModal";
import LocationChangeModal from "@common/components/LocationChangeModal";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { ActivitiesService } from "../services/activitiesService";
import type { PlaceDetails } from "@features/import/services/locationService";
import { activityPatched } from "../store/activitiesSlice";
import { getDateVisuals } from "../utils/dateVisuals";

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
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateSubmitting, setDateSubmitting] = useState(false);
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
    themeMode: mode,
    textColor: colors.text,
  });

  const officialDateLabel = formatDisplayDate(officialDateValue);
  const plannedDateLabel = formatDisplayDateTime(activity.planned_at);
  const primaryDateLabel = formatDisplayDateTime(getPrimaryDateValue(activity));
  const officialDates = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(activity.dates)) {
      list.push(
        ...activity.dates
          .filter((d): d is string => Boolean(d))
          .map((d) => formatDisplayDateTime(d) ?? formatDisplayDate(d) ?? d)
      );
    } else if (activity.main_date) {
      list.push(
        formatDisplayDateTime(activity.main_date) ??
          formatDisplayDate(activity.main_date) ??
          activity.main_date
      );
    }
    const unique = Array.from(new Set(list));
    return unique;
  }, [activity.dates, activity.main_date]);
  const locationLabel =
    formatActivityLocation(activity) ??
    t("activities:details.locationFallback");
  const needsDate = categoryNeedsDate(activity.category);

  const planActionLabel = plannedDateLabel
    ? t("activities:planned.ctaEdit")
    : t("activities:planned.ctaAdd");

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
    {
      key: "favorite",
      label: t("activities:details.actions.favorite"),
      icon: isFavorite ? "heart" : "heart-outline",
      iconColor: isFavorite ? colors.favorite : undefined,
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
    async (payload: { place: PlaceDetails; note: string | null }) => {
      if (!activity) return;
      setLocationSubmitting(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: activity.id,
          userId,
          place: payload.place,
          note: payload.note,
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

  const handleSuggestDate = useCallback(() => {
    Alert.alert(
      t("activities:details.suggestDateTitle"),
      t("activities:details.suggestDateSubtitle"),
      [
        { text: t("common:buttons.cancel"), style: "cancel" },
        {
          text: t("activities:details.suggestDateConfirm"),
          onPress: () => setDateModalVisible(true),
        },
      ],
      { cancelable: true }
    );
  }, [t]);

  const handleSubmitDateSuggestion = useCallback(
    async (payload: { date: Date; note: string | null }) => {
      if (!activity) return;
      setDateSubmitting(true);
      try {
        await ActivitiesService.submitDateSuggestion({
          activityId: activity.id,
          userId,
          suggestedDate: payload.date,
          note: payload.note,
        });
        Alert.alert(
          t("activities:details.suggestDateSuccessTitle"),
          t("activities:details.suggestDateSuccessMessage")
        );
        setDateModalVisible(false);
      } catch (e) {
        Alert.alert(
          t("activities:details.suggestDateErrorTitle"),
          t("activities:details.suggestDateErrorMessage")
        );
      } finally {
        setDateSubmitting(false);
      }
    },
    [activity, t, userId]
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
          plannedDateLabel={plannedDateLabel}
          officialDateLabel={officialDateLabel}
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
        {(needsDate || officialDates.length > 0) && (
          <>
            <InfoRow
              icon="calendar"
              value={
                officialDates.length > 0
                  ? officialDates.join(" · ")
                  : t("activities:details.dateMissing")
              }
              rightSlot={<DateAssistButton onSuggest={handleSuggestDate} />}
            />
          </>
        )}

        {plannedDateLabel ? (
          <View style={styles.planInlineSection}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
              {t("activities:planned.title")}
            </Text>
            <View style={styles.planInlineRow}>
              <DateBadge
                label={plannedDateLabel}
                tone="default"
                icon={getDateVisuals(colors, "planned").icon}
                iconColor={getDateVisuals(colors, "planned").color}
                iconBackgroundColor={
                  getDateVisuals(colors, "planned").background
                }
                labelWeight="normal"
              />
              <View style={styles.planActions}>
                <IconButton
                  mode="contained-tonal"
                  icon="pencil"
                  onPress={openPicker}
                  containerColor={colors.primary}
                  iconColor={colors.surface}
                  size={22}
                  style={styles.iconButton}
                />
                <IconButton
                  mode="contained-tonal"
                  icon="trash-can-outline"
                  onPress={() => onChangePlannedDate(activity, null)}
                  containerColor={colors.primary}
                  iconColor={colors.surface}
                  size={22}
                  style={styles.iconButton}
                />
              </View>
            </View>
          </View>
        ) : null}
      </BottomSheetScrollView>

      <LocationChangeModal
        visible={locationModalVisible}
        onClose={handleCloseLocationModal}
        onSelectPlace={handleSubmitLocation}
        submitting={locationSubmitting}
        initialValue={undefined}
        title={t("activities:report.title")}
        subtitle={t("activities:report.subtitle", {
          title: activity.title ?? t("common:labels.activity"),
        })}
      />
      <DateChangeModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onSubmit={handleSubmitDateSuggestion}
        submitting={dateSubmitting}
        initialValue={
          officialDateValue ? new Date(officialDateValue) : undefined
        }
        title={t("activities:details.suggestDateTitle")}
        subtitle={t("activities:details.suggestDateSubtitleForActivity", {
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
  planInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  planInlineSection: {
    marginTop: 10,
    gap: 6,
  },
  planInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRailWrapper: {
    marginTop: 6,
  },
});
