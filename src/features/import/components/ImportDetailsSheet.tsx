import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import type { Activity } from "@features/activities/utils/types";
import LocationSection from "./LocationSection";
import DateSection from "./DateSection";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import {
  formatActivityLocation,
  formatDisplayDate,
} from "@features/activities/utils/activityDisplay";

import { PlaceDetails } from "../services/locationService";
import type { ImportDraftDetails, UpdateActivityPayload } from "../utils/types";

interface ImportDetailsSheetProps {
  activity: Activity;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const ImportDetailsSheet: React.FC<ImportDetailsSheetProps> = ({
  activity,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
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

    setDirty(false);
    onDirtyChange?.(false);
  }, [
    activity.id,
    activity.location_name,
    activity.address,
    activity.main_date,
  ]);

  const handleSavePress = () => {
    const payload: UpdateActivityPayload = {
      location: draft.location,
      dateIso: draft.date ? draft.date.toISOString() : null,
    };
    onSave(payload);
  };

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

  const canEditLocation = !activity.needs_location_confirmation;
  const canEditDate = !activity.needs_date_confirmation;
  const needsDate = categoryNeedsDate(activity.category);

  const hideSaveButton =
    canEditLocation && (!needsDate || (needsDate && canEditDate));

  const heroLocation =
    draft.location?.name ||
    formatActivityLocation(activity) ||
    "Lieu à confirmer";
  const heroDate = formatDisplayDate(draft.date ?? activity.main_date);

  return (
    <View style={styles.sheetContent}>
      <ActivityHero
        title={activity.title ?? "Activité"}
        category={activity.category}
        location={heroLocation}
        dateLabel={heroDate}
        imageUrl={activity.image_url}
        showOverlayContent={false}
      />

      <ActivitySummaryHeader
        title={activity.title ?? "Activité"}
        category={activity.category}
        location={heroLocation}
        dateLabel={heroDate}
        style={styles.headerBlock}
      />

      <View style={styles.sectionCard}>
        <LocationSection
          locationName={draft.location?.name ?? activity.location_name ?? ""}
          address={
            draft.location?.formattedAddress ?? activity.address ?? ""
          }
          confirmed={!activity.needs_location_confirmation}
          onChange={handleLocationChange}
        />

        {showActivityDate && (
          <DateSection
            date={draft.date}
            confirmed={!activity.needs_date_confirmation}
            onChange={handleDateChange}
          />
        )}
      </View>

      {!hideSaveButton && (
        <View style={styles.bottomButtons}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
            disabled={!dirty}
            onPress={handleSavePress}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    paddingBottom: 20,
    paddingHorizontal: 12,
    gap: 10,
  },
  sectionCard: {
    marginTop: 2,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  headerBlock: {
    paddingHorizontal: 2,
  },
  bottomButtons: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#64748b",
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  saveBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});

export default ImportDetailsSheet;
