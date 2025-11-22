import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import InfoRow from "@features/activities/components/InfoRow";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { formatDisplayDate } from "@features/activities/utils/activityDisplay";

interface DateSectionProps {
  infoValue: string;
  date: Date | null;
  confirmed: boolean;
  onChange: (date: Date | null) => void;
  editRequest?: number;
}

const DateSection: React.FC<DateSectionProps> = ({
  infoValue,
  date,
  confirmed,
  onChange,
  editRequest = 0,
}) => {
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const lastEditRequestRef = useRef(editRequest);

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

  useEffect(() => {
    if (editRequest !== lastEditRequestRef.current) {
      setEditing(true);
      setPickerVisible(true);
      lastEditRequestRef.current = editRequest;
    }
  }, [editRequest]);

  useEffect(() => {
    setEditing(false);
    setPickerVisible(false);
  }, [date, confirmed]);

  const hasDate = !!date;

  return (
    <View style={styles.section}>
      <InfoRow icon="calendar" value={infoValue} />

      <Text style={styles.sectionLabel}>{t("import:dateSection.label")}</Text>

      {!hasDate ? (
        <Text style={styles.helperText}>{t("import:dateSection.notFound")}</Text>
      ) : (
        <Text style={styles.helperText}>
          {confirmed
            ? t("import:dateSection.confirmed")
            : t("import:dateSection.notAccurate")}
        </Text>
      )}

      {hasDate ? (
        <Text style={styles.previewText}>{displayLabel()}</Text>
      ) : null}

      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
          setEditing((prev) => {
            const next = !prev;
            setPickerVisible(next);
            return next;
          });
        }}
      >
        <Text style={styles.primaryBtnText}>
          {hasDate
            ? t("import:dateSection.edit")
            : t("import:dateSection.add")}
        </Text>
      </Pressable>

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
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
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
    marginTop: 2,
    color: "#475569",
  },
  previewText: {
    fontSize: 14,
    marginTop: 6,
    color: "#0f172a",
  },
  primaryBtn: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#0f172a",
    alignSelf: "flex-start",
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});

export default DateSection;
