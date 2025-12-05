import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppModal from "@common/components/AppModal";
import { useAppTheme } from "@common/theme/appTheme";
import { formatDisplayDateTime } from "../utils/activityDisplay";
import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";

type Props = {
  visible: boolean;
  initialValue?: Date | null;
  submitting?: boolean;
  onSubmit: (payload: { date: Date; note: string | null }) => void;
  onClose: () => void;
};

const DateChangeModal: React.FC<Props> = ({
  visible,
  initialValue,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialValue ?? new Date()
  );

  useEffect(() => {
    if (initialValue) {
      setSelectedDate(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (!visible) {
      setNote("");
      setSelectedDate(initialValue ?? new Date());
    }
  }, [initialValue, visible]);

  const { openPicker, pickerModal } = usePlatformDateTimePicker({
    value: selectedDate,
    onChange: setSelectedDate,
    cardColor: colors.card,
    themeMode: mode,
    textColor: colors.text,
  });

  const formattedDate = useMemo(
    () => formatDisplayDateTime(selectedDate) ?? selectedDate.toDateString(),
    [selectedDate]
  );

  const handleConfirm = () => {
    onSubmit({
      date: selectedDate,
      note: note.trim() ? note.trim() : null,
    });
  };

  const isDisabled = submitting || !selectedDate;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={t("activities:details.suggestDateTitle")}
      subtitle={t("activities:details.suggestDateSubtitle")}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("activities:details.suggestDatePickLabel")}
        </Text>

        <Pressable
          style={[
            styles.dateButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          onPress={openPicker}
        >
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formattedDate}
          </Text>
        </Pressable>

        <Text style={[styles.label, { color: colors.text }]}>
          {t("activities:details.suggestDateNoteLabel")}
        </Text>
        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("activities:details.suggestDateNotePlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {pickerModal}

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={onClose}
            disabled={submitting}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {t("common:buttons.cancel")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.primaryButton,
              {
                backgroundColor: isDisabled ? colors.overlay : colors.accent,
                borderColor: isDisabled ? colors.border : colors.accent,
              },
            ]}
            onPress={handleConfirm}
            disabled={isDisabled}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: isDisabled ? colors.secondaryText : colors.accentText,
                },
              ]}
            >
              {submitting
                ? t("activities:details.suggestDateSubmitting")
                : t("activities:details.suggestDateConfirm")}
            </Text>
          </Pressable>
        </View>
      </View>
    </AppModal>
  );
};

export default DateChangeModal;

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  dateButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButton: {},
  primaryButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
