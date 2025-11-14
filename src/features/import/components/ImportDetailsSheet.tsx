import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { Activity } from "@features/activities/utils/types";

interface ImportDetailsSheetProps {
  activity: Activity;
  onSave: (payload: {
    locationName: string;
    city: string;
    dateIso: string | null;
  }) => void;
  onCancel: () => void;
}

const ImportDetailsSheet: React.FC<ImportDetailsSheetProps> = ({
  activity,
  onSave,
  onCancel,
}) => {
  const initialDateRaw =
    (activity as any).main_date || (activity as any).date || null;
  const initialDate = initialDateRaw ? new Date(initialDateRaw) : null;

  const [locationName, setLocationName] = useState(
    activity.location_name ?? ""
  );
  const [city, setCity] = useState(activity.city ?? "");
  const [localDate, setLocalDate] = useState<Date | null>(initialDate);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocationName(activity.location_name ?? "");
    setCity(activity.city ?? "");
    const raw = (activity as any).main_date || (activity as any).date || null;
    setLocalDate(raw ? new Date(raw) : null);
    setDirty(false);
  }, [activity.id]);

  const locationConfirmed = useMemo(
    () => locationName.trim().length > 0 && city.trim().length > 0,
    [locationName, city]
  );

  const dateConfirmed = useMemo(() => !!localDate, [localDate]);

  const displayDateLabel = () => {
    if (!localDate) return "Select date";
    return localDate.toDateString();
  };

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setDatePickerVisible(false);
    if (!selected) return;
    setLocalDate(selected);
    setDirty(true);
  };

  const handleSavePress = () => {
    onSave({
      locationName: locationName.trim(),
      city: city.trim(),
      dateIso: localDate ? localDate.toISOString() : null,
    });
  };

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

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Location</Text>

        <TextInput
          style={styles.input}
          value={locationName}
          onChangeText={(v) => {
            setLocationName(v);
            setDirty(true);
          }}
          placeholder="Place name"
        />
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={(v) => {
            setCity(v);
            setDirty(true);
          }}
          placeholder="City"
        />

        {!locationConfirmed ? (
          <Text style={styles.warning}>⚠️ Needs location</Text>
        ) : (
          <Text style={styles.success}>✓ Location ready to save</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Date</Text>

        <View style={styles.dateRow}>
          <Pressable
            style={styles.dateBtn}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.dateBtnText}>{displayDateLabel()}</Text>
          </Pressable>
        </View>

        {datePickerVisible && (
          <DateTimePicker
            value={localDate || new Date()}
            mode="date"
            onChange={handleDateChange}
          />
        )}

        {!dateConfirmed ? (
          <Text style={styles.warning}>⚠️ Needs date</Text>
        ) : (
          <Text style={styles.success}>✓ Date ready to save</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Confidence</Text>
        <Text style={styles.sectionValue}>
          {typeof activity.confidence === "number"
            ? `${Math.round(activity.confidence * 100)}%`
            : "—"}
        </Text>
      </View>

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
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 14,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  dateBtn: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f2f2f2",
  },
  dateBtnText: {
    fontSize: 14,
  },
  warning: {
    marginTop: 4,
    fontSize: 13,
    color: "#d9534f",
  },
  success: {
    marginTop: 4,
    fontSize: 13,
    color: "#2ecc71",
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
