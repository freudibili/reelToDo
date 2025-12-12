import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { AppThemeMode } from "@common/theme/appTheme";

type UsePlatformDateTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  cardColor: string;
  themeMode: AppThemeMode;
  textColor?: string;
};

export const usePlatformDateTimePicker = ({
  value,
  onChange,
  cardColor,
  themeMode,
  textColor,
}: UsePlatformDateTimePickerProps) => {
  const [visible, setVisible] = useState(false);
  const themeVariant = themeMode === "dark" ? "dark" : "light";

  const handleIosChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    setVisible(false);
    if (!selected || event.type === "dismissed") return;
    onChange(selected);
  };

  const handleAndroidTimeChange = (
    originalDate: Date
  ) => (event: DateTimePickerEvent, timeDate?: Date) => {
    if (event.type === "dismissed" || !timeDate) return;
    const finalDate = new Date(originalDate);
    finalDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
    onChange(finalDate);
  };

  const handleAndroidDateChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (event.type === "dismissed" || !selected) return;
    const mergedDate = new Date(value);
    mergedDate.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );

    DateTimePickerAndroid.open({
      value: mergedDate,
      mode: "time",
      is24Hour: true,
      onChange: handleAndroidTimeChange(mergedDate),
    });
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        onChange: handleAndroidDateChange,
      });
      return;
    }
    setVisible(true);
  };

  const pickerModal =
    Platform.OS === "ios" && visible ? (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
          <DateTimePicker
            value={value}
            mode="datetime"
            display="spinner"
            themeVariant={themeVariant}
            textColor={textColor}
            onChange={handleIosChange}
          />
        </View>
      </Modal>
    ) : null;

  return { openPicker, pickerModal };
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 30,
    borderRadius: 14,
    padding: 12,
  },
});
