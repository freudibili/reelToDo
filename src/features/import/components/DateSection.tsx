import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface DateSectionProps {
  date: Date | null;
  confirmed: boolean;
  onChange: (date: Date) => void;
}

const DateSection: React.FC<DateSectionProps> = ({
  date,
  confirmed,
  onChange,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);

  const displayLabel = () => {
    if (!date) return "Select date";
    return date.toDateString();
  };

  const handleDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    setPickerVisible(false);
    if (!selected) return;
    onChange(selected);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Date</Text>

      {confirmed ? (
        <Text style={styles.dateText}>{displayLabel()}</Text>
      ) : (
        <>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.dateBtn}
              onPress={() => setPickerVisible(true)}
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

          <Text style={styles.warning}>⚠️ Needs date</Text>
        </>
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
  dateBtnText: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    marginTop: 6,
  },
  warning: {
    marginTop: 4,
    fontSize: 13,
    color: "#d9534f",
  },
});

export default DateSection;
