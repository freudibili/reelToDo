import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet } from "react-native";

import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import { Box, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch } from "@core/store/hook";
import { ActivitiesService } from "@features/activities/services/activitiesService";
import { activityPatched } from "@features/activities/store/activitiesSlice";
import type { Activity } from "@features/activities/types";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";

import DateSection from "./DateSection";
import LocationSection from "./LocationSection";
import type { PlaceDetails , type ImportDraftDetails, type UpdateActivityPayload } from "../types";

export type ImportDetailsFormHandle = {
  save: () => void;
};

type ImportDetailsFormProps = {
  activity: Activity;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  userId?: string | null;
};

const ImportDetailsForm = React.forwardRef<
  ImportDetailsFormHandle,
  ImportDetailsFormProps
>(({ activity, onSave, onDirtyChange, userId }, ref) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const [dirty, setDirty] = useState(false);
  const officialDateValue = getOfficialDateValue(activity);
  const [draft, setDraft] = useState<ImportDraftDetails>(() => ({
    location: null,
    date: officialDateValue ? new Date(officialDateValue) : null,
  }));
  const [suggestingLocation, setSuggestingLocation] = useState(false);

  const isOwner = !!userId && activity.user_id === userId;
  const hasExistingLocation =
    !!activity.address ||
    !!activity.location_name ||
    activity.latitude !== null ||
    activity.longitude !== null;
  const canEditLocation = isOwner || !hasExistingLocation;

  const markDirty = useCallback(() => {
    if (!dirty) {
      setDirty(true);
      onDirtyChange?.(true);
    }
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    setDraft({
      location: null,
      date: officialDateValue ? new Date(officialDateValue) : null,
    });

    setDirty(false);
    onDirtyChange?.(false);
  }, [
    activity.id,
    activity.location_name,
    activity.address,
    officialDateValue,
    onDirtyChange,
  ]);

  const handleSavePress = useCallback(() => {
    const payload: UpdateActivityPayload = {
      location: draft.location,
      dateIso: draft.date ? draft.date.toISOString() : null,
    };
    onSave(payload);
  }, [draft, onSave]);

  const handleSuggestLocation = useCallback(
    async (payload: { place: PlaceDetails; note: string | null }) => {
      setSuggestingLocation(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: activity.id,
          userId: userId ?? null,
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
      } catch (e) {
        Alert.alert(
          t("activities:report.errorTitle"),
          t("activities:report.errorMessage")
        );
        throw e;
      } finally {
        setSuggestingLocation(false);
      }
    },
    [activity.id, dispatch, t, userId]
  );

  useImperativeHandle(ref, () => ({
    save: handleSavePress,
  }));

  const handleLocationChange = (place: PlaceDetails) => {
    setDraft((prev) => ({
      ...prev,
      location: place,
    }));
    markDirty();
  };

  const handleDateChange = (date: Date | null) => {
    setDraft((prev) => ({
      ...prev,
      date,
    }));
    markDirty();
  };

  const showActivityDate = categoryNeedsDate(activity.category);

  const heroLocation =
    draft.location?.name ||
    formatActivityLocation(activity) ||
    t("import:details.locationFallback");
  const heroDate = formatDisplayDate(draft.date ?? officialDateValue);
  const locationInfo =
    draft.location?.formattedAddress ??
    formatActivityLocation(activity) ??
    t("import:details.locationFallback");
  const dateInfo = heroDate ?? t("activities:details.dateMissing");

  return (
    <Stack gap="md" style={styles.container}>
      <ActivitySummaryHeader
        title={activity.title ?? t("common:labels.activity")}
        category={activity.category}
        location={heroLocation}
        officialDateLabel={heroDate}
        dateLabel={heroDate}
        style={styles.headerBlock}
      />

      <ActivityHero
        title={activity.title ?? t("common:labels.activity")}
        category={activity.category}
        location={heroLocation}
        dateLabel={heroDate}
        imageUrl={activity.image_url}
        showOverlayContent={false}
      />

      <Stack gap="xxs" style={styles.sectionHeader}>
        <Text variant="headline" weight="700">
          {t("import:details.infoLabel")}
        </Text>
        <Box height={2} width={40} rounded="pill" background={colors.primary} />
      </Stack>

      <LocationSection
        infoValue={locationInfo}
        locationName={draft.location?.name ?? activity.location_name ?? ""}
        address={draft.location?.formattedAddress ?? activity.address ?? ""}
        confirmed={!activity.needs_location_confirmation}
        mode={canEditLocation ? "edit" : "suggest"}
        onSuggest={canEditLocation ? undefined : handleSuggestLocation}
        submitting={suggestingLocation}
        activityTitle={activity.title ?? t("common:labels.activity")}
        onChange={handleLocationChange}
      />

      {showActivityDate ? (
        <DateSection
          infoValue={dateInfo}
          date={draft.date}
          confirmed={!activity.needs_date_confirmation}
          onChange={handleDateChange}
        />
      ) : null}
    </Stack>
  );
});

ImportDetailsForm.displayName = "ImportDetailsForm";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  headerBlock: {
    paddingHorizontal: 4,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 12,
  },
});

export default ImportDetailsForm;
