import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

import type { Activity } from "@features/activities/utils/types";
import LocationSection from "./LocationSection";
import DateSection from "./DateSection";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";

interface ImportDetailsSheetProps {
  activity: Activity;
  onSave: (payload: {
    locationName: string;
    city: string;
    dateIso: string | null;
  }) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const ImportDetailsSheet: React.FC<ImportDetailsSheetProps> = ({
  activity,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const initialDateRaw = activity.main_date || null;
  const initialDate = initialDateRaw ? new Date(initialDateRaw) : null;

  const [locationName, setLocationName] = useState(
    activity.location_name ?? ""
  );
  const [city, setCity] = useState(activity.city ?? "");
  const [localDate, setLocalDate] = useState<Date | null>(initialDate);
  const [dirty, setDirty] = useState(false);

  const setDirtyAndNotify = (value: boolean) => {
    setDirty(value);
    if (onDirtyChange) {
      onDirtyChange(value);
    }
  };

  useEffect(() => {
    setLocationName(activity.location_name ?? "");
    setCity(activity.city ?? "");
    const raw = activity.main_date || null;
    setLocalDate(raw ? new Date(raw) : null);
    setDirtyAndNotify(false);
  }, [activity.id]);

  const locationLocked = activity.needs_location_confirmation === false;
  const dateLocked = activity.needs_date_confirmation === false;

  const locationConfirmed = useMemo(
    () =>
      locationLocked ||
      (locationName.trim().length > 0 && city.trim().length > 0),
    [locationLocked, locationName, city]
  );

  const dateConfirmed = useMemo(
    () => dateLocked || !!localDate,
    [dateLocked, localDate]
  );

  const handleDateChange = (date: Date) => {
    if (dateLocked) return;
    setLocalDate(date);
    if (!dirty) {
      setDirtyAndNotify(true);
    }
  };

  const handleSavePress = () => {
    onSave({
      locationName: locationName.trim(),
      city: city.trim(),
      dateIso: localDate ? localDate.toISOString() : null,
    });
  };

  const handleLocationNameChange = (value: string) => {
    if (locationLocked) return;
    setLocationName(value);
    if (!dirty) {
      setDirtyAndNotify(true);
    }
  };

  const handleCityChange = (value: string) => {
    if (locationLocked) return;
    setCity(value);
    if (!dirty) {
      setDirtyAndNotify(true);
    }
  };

  const showActivity = categoryNeedsDate(activity.category);

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
        locationName={locationName}
        city={city}
        locked={locationLocked}
        confirmed={locationConfirmed}
        onChangeLocationName={handleLocationNameChange}
        onChangeCity={handleCityChange}
      />

      {showActivity && (
        <DateSection
          date={localDate}
          locked={dateLocked}
          confirmed={dateConfirmed}
          onChangeDate={handleDateChange}
        />
      )}

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
