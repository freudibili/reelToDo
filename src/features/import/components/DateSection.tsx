import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface DateSectionProps {
  date: Date | null;
  locked: boolean;
  confirmed: boolean;
  onChangeDate: (date: Date) => void;
}

const DateSection: React.FC<DateSectionProps> = ({
  date,
  locked,
  confirmed,
  onChangeDate,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);

  const displayLabel = () => {
    if (!date) return "Select date";
    return date.toDateString();
  };

  const handleDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    setPickerVisible(false);
    if (!selected || locked) return;
    onChangeDate(selected);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Date</Text>

      <View style={styles.dateRow}>
        <Pressable
          style={[styles.dateBtn, locked && styles.dateBtnDisabled]}
          onPress={() => !locked && setPickerVisible(true)}
          disabled={locked}
        >
          <Text style={styles.dateBtnText}>{displayLabel()}</Text>
        </Pressable>
      </View>

      {pickerVisible && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          onChange={handleDateChange}
        />
      )}

      {!confirmed ? (
        <Text style={styles.warning}>⚠️ Needs date</Text>
      ) : locked ? (
        <Text style={styles.success}>✓ Date confirmed</Text>
      ) : (
        <Text style={styles.success}>✓ Date ready to save</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
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
  dateBtnDisabled: {
    opacity: 0.5,
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
});

export default DateSection;
