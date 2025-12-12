import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Button, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { formatDisplayDate } from "@features/activities/utils/activityDisplay";

type DateSectionProps = {
  infoValue: string;
  date: Date | null;
  confirmed: boolean;
  onChange: (date: Date | null) => void;
  editRequest?: number;
};

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
    <Card
      padding="lg"
      radius="lg"
      variant="outlined"
      shadow="sm"
      style={styles.section}
    >
      <Stack gap="sm">
        <Stack direction="row" align="center" gap="sm">
          <Icon source="calendar" size={20} color={colors.primary} />
          <Stack gap="xxs">
            <Text variant="headline" weight="700">
              {t("import:dateSection.label")}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {infoValue}
            </Text>
          </Stack>
        </Stack>

        <Text variant="bodySmall" tone="muted">
          {hasDate
            ? confirmed
              ? t("import:dateSection.confirmed")
              : t("import:dateSection.notAccurate")
            : t("import:dateSection.notFound")}
        </Text>

        {hasDate ? (
          <Text variant="bodySmall">{displayLabel()}</Text>
        ) : null}

        <Button
          label={
            hasDate ? t("import:dateSection.edit") : t("import:dateSection.add")
          }
          onPress={() => {
            setEditing(true);
            setPickerVisible(true);
          }}
          variant="primary"
          icon={
            <Icon
              source="calendar-edit"
              size={18}
              color={colors.favoriteContrast}
            />
          }
          shadow="sm"
        />

        {editing ? (
          <Stack gap="xs">
            <Button
              label={displayLabel()}
              onPress={showPicker}
              variant="secondary"
              icon={<Icon source="calendar" size={16} color={colors.primary} />}
            />

            {pickerVisible ? (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                themeVariant={themeVariant}
                textColor={colors.text}
                onChange={handleDateChange}
              />
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
});

export default DateSection;
