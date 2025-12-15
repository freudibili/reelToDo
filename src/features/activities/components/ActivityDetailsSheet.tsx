import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import LocationChangeModal from "@common/components/LocationChangeModal";
import { useAppTheme } from "@common/theme/appTheme";

import ActivityDetailsActions from "./ActivityDetailsActions";
import ActivityOverviewSection from "./ActivityOverviewSection";
import ActivityPlanSection from "./ActivityPlanSection";
import DateChangeModal from "./DateChangeModal";
import { useActivityDetailsViewModel } from "../hooks/useActivityDetailsViewModel";
import { useActivitySuggestionActions } from "../hooks/useActivitySuggestionActions";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import type { Activity } from "../types";

interface Props {
  activity: Activity | null;
  isFavorite: boolean;
  onDelete: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  onOpenMaps: (activity: Activity) => void;
  onOpenSource: (activity: Activity) => void;
  onChangePlannedDate: (activity: Activity, date: Date | null) => void;
  tabBarHeight?: number;
}

const ActivityDetailsSheet: React.FC<Props> = ({
  activity,
  isFavorite,
  onDelete,
  onToggleFavorite,
  onOpenMaps,
  onOpenSource,
  onChangePlannedDate,
  tabBarHeight = 0,
}) => {
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8) + tabBarHeight + 16;

  const viewModel = useActivityDetailsViewModel(activity, t);

  const { openPicker, pickerModal } = usePlatformDateTimePicker({
    value: viewModel.baseDate,
    onChange: (date) => {
      if (activity) {
        onChangePlannedDate(activity, date);
      }
    },
    cardColor: colors.card,
    themeMode: mode,
    textColor: colors.text,
  });

  const suggestionActions = useActivitySuggestionActions(activity);

  if (!activity) return null;

  const {
    officialDateValue,
    officialDateLabel,
    plannedDateLabel,
    primaryDateLabel,
    formattedOfficialDates,
    additionalDates,
    alternateLocations,
    locationLabel,
    needsDate,
  } = viewModel;

  const {
    locationModalVisible,
    locationSubmitting,
    openLocationModal,
    closeLocationModal,
    submitLocationSuggestion,
    dateModalVisible,
    dateSubmitting,
    promptDateSuggestion,
    closeDateModal,
    submitDateSuggestion,
  } = suggestionActions;

  return (
    <>
      <BottomSheetScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
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
          <ActivityDetailsActions
            activity={activity}
            isFavorite={isFavorite}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onOpenMaps={onOpenMaps}
            onOpenSource={onOpenSource}
            openPicker={openPicker}
          />
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

        <ActivityOverviewSection
          activity={activity}
          locationLabel={locationLabel}
          alternateLocations={alternateLocations}
          formattedOfficialDates={formattedOfficialDates}
          additionalDates={additionalDates}
          needsDate={needsDate}
          onOpenLocation={openLocationModal}
          onSuggestDate={promptDateSuggestion}
        />

        {plannedDateLabel ? (
          <ActivityPlanSection
            plannedDateLabel={plannedDateLabel}
            onEdit={openPicker}
            onClear={() => onChangePlannedDate(activity, null)}
          />
        ) : null}
      </BottomSheetScrollView>

      <LocationChangeModal
        visible={locationModalVisible}
        onClose={closeLocationModal}
        onSelectPlace={submitLocationSuggestion}
        submitting={locationSubmitting}
        initialValue={undefined}
        title={t("activities:report.title")}
        subtitle={t("activities:report.subtitle", {
          title: activity.title ?? t("common:labels.activity"),
        })}
      />
      <DateChangeModal
        visible={dateModalVisible}
        onClose={closeDateModal}
        onSubmit={submitDateSuggestion}
        submitting={dateSubmitting}
        initialValue={
          officialDateValue ? new Date(officialDateValue) : undefined
        }
        title={t("activities:details.suggestDateTitle")}
        subtitle={t("activities:details.suggestDateSubtitleForActivity", {
          title: activity.title ?? t("common:labels.activity"),
        })}
        mode="suggest"
      />
    </>
  );
};

export default ActivityDetailsSheet;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
    flexGrow: 1,
  },
  headerBlock: {
    paddingHorizontal: 0,
  },
  actionsRailWrapper: {
    marginTop: 6,
  },
});
