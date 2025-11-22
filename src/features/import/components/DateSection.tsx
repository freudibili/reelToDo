import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { formatDisplayDate } from "@features/activities/utils/activityDisplay";

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
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  const displayLabel = () => {
    if (!date) return t("import:dateSection.select");
    return formatDisplayDate(date) ?? date.toDateString();
  };

  const handleDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    setPickerVisible(false);
    if (!selected) return;
    onChange(selected);
    setEditing(false);
  };

  const showPicker = () => setPickerVisible(true);

  if (confirmed) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("import:dateSection.label")}</Text>
        <Text style={styles.dateText}>{displayLabel()}</Text>
      </View>
    );
  }

  const hasDate = !!date;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("import:dateSection.label")}</Text>

      {!hasDate ? (
        <>
          <Text style={styles.helperText}>
            {t("import:dateSection.notFound")}
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              setEditing(true);
              setPickerVisible(true);
            }}
          >
            <Text style={styles.primaryBtnText}>
              {t("import:dateSection.add")}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.helperText}>
            {t("import:dateSection.notAccurate")}
          </Text>
          <Text style={styles.previewText}>{displayLabel()}</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              setEditing(true);
              setPickerVisible(true);
            }}
          >
            <Text style={styles.primaryBtnText}>
              {t("import:dateSection.edit")}
            </Text>
          </Pressable>
        </>
      )}

      {editing && (
        <>
          <Pressable style={styles.dateBtn} onPress={showPicker}>
            <Text style={styles.dateBtnText}>{displayLabel()}</Text>
          </Pressable>

          {pickerVisible && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              onChange={handleDateChange}
            />
          )}
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
  dateBtn: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f2f2f2",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  dateBtnText: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    marginTop: 6,
  },
  helperText: {
    fontSize: 13,
    marginTop: 4,
  },
  previewText: {
    fontSize: 14,
    marginTop: 6,
  },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f2f2f2",
    alignSelf: "flex-start",
  },
  primaryBtnText: {
    fontSize: 14,
  },
});

export default DateSection;
