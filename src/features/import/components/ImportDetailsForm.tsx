import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { View, Text, StyleSheet } from "react-native";

import type { Activity } from "@features/activities/utils/types";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import LocationSection from "./LocationSection";
import DateSection from "./DateSection";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import {
  formatActivityLocation,
  formatDisplayDate,
} from "@features/activities/utils/activityDisplay";

import { PlaceDetails } from "../services/locationService";
import type { ImportDraftDetails, UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";

interface ImportDetailsFormProps {
  activity: Activity;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface ImportDetailsFormHandle {
  save: () => void;
}

const ImportDetailsForm = React.forwardRef<
  ImportDetailsFormHandle,
  ImportDetailsFormProps
>(({ activity, onSave, onCancel: _onCancel, onDirtyChange }, ref) => {
  const { t } = useTranslation();
  const [dirty, setDirty] = useState(false);
  const [draft, setDraft] = useState<ImportDraftDetails>(() => ({
    location: null,
    date: activity.main_date ? new Date(activity.main_date) : null,
  }));

  const markDirty = () => {
    if (!dirty) {
      setDirty(true);
      onDirtyChange?.(true);
    }
  };

  useEffect(() => {
    setDraft({
      location: null,
      date: activity.main_date ? new Date(activity.main_date) : null,
    });

    setDirty(true);
    onDirtyChange?.(true);
  }, [
    activity.id,
    activity.location_name,
    activity.address,
    activity.main_date,
  ]);

  const handleSavePress = useCallback(() => {
    const payload: UpdateActivityPayload = {
      location: draft.location,
      dateIso: draft.date ? draft.date.toISOString() : null,
    };
    onSave(payload);
  }, [draft, onSave]);

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
  const heroDate = formatDisplayDate(draft.date ?? activity.main_date);
  const locationInfo =
    draft.location?.formattedAddress ??
    formatActivityLocation(activity) ??
    t("import:details.locationFallback");
  const dateInfo = heroDate ?? t("activities:details.dateMissing");

  return (
    <View style={styles.container}>
      <ActivitySummaryHeader
        title={activity.title ?? t("common:labels.activity")}
        category={activity.category}
        location={heroLocation}
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Info</Text>
        <View style={styles.sectionUnderline} />
      </View>

      <LocationSection
        infoValue={locationInfo}
        locationName={draft.location?.name ?? activity.location_name ?? ""}
        address={draft.location?.formattedAddress ?? activity.address ?? ""}
        confirmed={!activity.needs_location_confirmation}
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
    </View>
  );
});

ImportDetailsForm.displayName = "ImportDetailsForm";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 12,
  },
  headerBlock: {
    paddingHorizontal: 4,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 40,
    backgroundColor: "#0f172a",
    borderRadius: 999,
  },
});

export default ImportDetailsForm;
