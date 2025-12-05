import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import InfoRow from "@features/activities/components/InfoRow";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { formatDisplayDate } from "@features/activities/utils/activityDisplay";
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors, mode } = useAppTheme();
  const themeVariant = mode === "dark" ? "dark" : "light";

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
    <View
      style={[
        styles.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <InfoRow icon="calendar" value={infoValue} />

      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        {t("import:dateSection.label")}
      </Text>

      {!hasDate ? (
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          {t("import:dateSection.notFound")}
        </Text>
      ) : (
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          {confirmed
            ? t("import:dateSection.confirmed")
            : t("import:dateSection.notAccurate")}
        </Text>
      )}

      {hasDate ? (
        <Text style={[styles.previewText, { color: colors.text }]}>
          {displayLabel()}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => {
          setEditing((prev) => {
            const next = !prev;
            setPickerVisible(next);
            return next;
          });
        }}
      >
        <Text
          style={[
            styles.primaryBtnText,
            { color: mode === "dark" ? colors.background : colors.surface },
          ]}
        >
          {hasDate
            ? t("import:dateSection.edit")
            : t("import:dateSection.add")}
        </Text>
      </Pressable>

      {editing && (
        <>
          <Pressable
            style={[
              styles.dateBtn,
              { backgroundColor: colors.mutedSurface, borderColor: colors.border },
            ]}
            onPress={showPicker}
          >
            <Text style={[styles.dateBtnText, { color: colors.text }]}>
              {displayLabel()}
            </Text>
          </Pressable>

          {pickerVisible && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              themeVariant={themeVariant}
              textColor={colors.text}
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
    borderRadius: 12,
    borderWidth: 1,
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
    borderWidth: 1,
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
  },
  previewText: {
    fontSize: 14,
    marginTop: 6,
  },
  primaryBtn: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default DateSection;
