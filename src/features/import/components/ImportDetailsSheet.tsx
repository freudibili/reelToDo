import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

import type { Activity } from "@features/activities/utils/types";
import LocationSection from "./LocationSection";
import DateSection from "./DateSection";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";

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

  return (
    <View style={styles.sheetContent}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{activity.title}</Text>
        <Text style={styles.sheetCategory}>{activity.category}</Text>
        {activity.creator && (
          <Text style={styles.sheetCreator}>by {activity.creator}</Text>
        )}
      </View>

      {activity.image_url && (
        <Image
          source={{ uri: activity.image_url }}
          style={styles.sheetImage}
          resizeMode="cover"
        />
      )}

      <LocationSection
        locationName={draft.location?.name ?? activity.location_name ?? ""}
        address={draft.location?.formattedAddress ?? activity.address ?? ""}
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
    paddingBottom: 40,
    paddingHorizontal: 4,
  },
  sheetImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  sheetHeader: {
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sheetCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  sheetCreator: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  bottomButtons: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 15,
    color: "#666",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#000",
  },
  saveBtnDisabled: {
    backgroundColor: "#bbb",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ImportDetailsSheet;
