import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import AppModal from "@common/components/AppModal";
import { Box, Button, Input, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import { usePlatformDateTimePicker } from "../hooks/usePlatformDateTimePicker";
import { formatDisplayDateTime } from "../utils/activityDisplay";

type Props = {
  visible: boolean;
  initialValue?: Date | null;
  submitting?: boolean;
  onSubmit: (payload: { date: Date; note: string | null }) => void;
  title?: string;
  subtitle?: string;
  onClose: () => void;
};

const DateChangeModal: React.FC<Props> = ({
  visible,
  initialValue,
  submitting = false,
  onSubmit,
  title,
  subtitle,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialValue ?? new Date()
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  const isSameMoment = (a: Date, b: Date) => a.getTime() === b.getTime();
  const hasChangedFromInitial =
    initialValue && selectedDate
      ? !isSameMoment(selectedDate, initialValue)
      : hasInteracted;

  useEffect(() => {
    if (initialValue) {
      setSelectedDate(initialValue);
      setHasInteracted(false);
    }
  }, [initialValue]);

  useEffect(() => {
    if (!visible) {
      setNote("");
      setSelectedDate(initialValue ?? new Date());
      setHasInteracted(false);
    }
  }, [initialValue, visible]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setHasInteracted(true);
  };

  const { openPicker, pickerModal } = usePlatformDateTimePicker({
    value: selectedDate,
    onChange: handleSelectDate,
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

  const isDisabled = submitting || !selectedDate || !hasChangedFromInitial;
  const resolvedTitle = title ?? t("activities:details.suggestDateTitle");
  const resolvedSubtitle =
    subtitle ??
    t("activities:details.suggestDateSubtitle");

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
    >
      <Stack gap="md" style={styles.content}>
        <Text variant="headline" weight="700">
          {t("activities:details.suggestDatePickLabel")}
        </Text>

        <Button
          label={formattedDate}
          variant="outline"
          onPress={openPicker}
          icon={<Icon source="calendar" size={16} color={colors.text} />}
          fullWidth
        />

        <Text variant="headline" weight="700">
          {t("activities:details.suggestDateNoteLabel")}
        </Text>
        <Input
          placeholder={t("activities:details.suggestDateNotePlaceholder")}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {pickerModal}

        <Box direction="row" gap={10}>
          <Button
            label={t("common:buttons.cancel")}
            variant="secondary"
            onPress={onClose}
            disabled={submitting}
            style={{ flex: 1 }}
          />
          <Button
            label={
              submitting
                ? t("activities:details.suggestDateSubmitting")
                : t("activities:details.suggestDateConfirm")
            }
            variant="primary"
            onPress={handleConfirm}
            disabled={isDisabled}
            style={{ flex: 1 }}
          />
        </Box>
      </Stack>
    </AppModal>
  );
};

export default DateChangeModal;

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
