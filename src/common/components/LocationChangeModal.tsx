import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Box, Button, Input, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import LocationAutocompleteInput from "@features/import/components/LocationAutocompleteInput";
import type { PlaceDetails } from "@features/import/services/locationService";
import AppModal from "./AppModal";

interface LocationChangeModalProps {
  visible: boolean;
  initialValue?: string;
  title?: string;
  subtitle?: string;
  submitting?: boolean;
  onSelectPlace: (payload: {
    place: PlaceDetails;
    note: string | null;
  }) => void;
  onClose: () => void;
}

const LocationChangeModal: React.FC<LocationChangeModalProps> = ({
  visible,
  initialValue,
  title,
  subtitle,
  submitting = false,
  onSelectPlace,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [note, setNote] = useState("");
  const isConfirmDisabled = !selectedPlace || submitting;
  const isCancelDisabled = submitting;

  useEffect(() => {
    if (!visible) {
      setSelectedPlace(null);
      setNote("");
    }
  }, [visible]);

  const resolvedTitle = title ?? t("common:locationPicker.title");
  const resolvedSubtitle = subtitle ?? t("common:locationPicker.subtitle");

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
    >
      <Stack gap="lg" style={styles.content}>
        <LocationAutocompleteInput
          initialValue={initialValue}
          onSelectPlace={(place) => {
            setSelectedPlace(place);
          }}
          placeholder={t("common:locationPicker.placeholder")}
        />

        <Box style={styles.noteGroup} gap={6}>
          <Text variant="headline" weight="700">
            {t("activities:report.noteLabel")}
          </Text>
          <Input
            placeholder={t("activities:report.notePlaceholder")}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </Box>

        <Box direction="row" gap={10}>
          <Button
            label={t("common:buttons.cancel")}
            variant="secondary"
            onPress={onClose}
            disabled={isCancelDisabled}
            style={{ flex: 1 }}
          />
          <Button
            label={
              submitting
                ? t("common:locationPicker.submitting")
                : t("common:locationPicker.confirm")
            }
            variant="primary"
            onPress={() => {
              if (selectedPlace) {
                const trimmedNote = note.trim();
                onSelectPlace({
                  place: selectedPlace,
                  note: trimmedNote ? trimmedNote : null,
                });
              }
            }}
            disabled={isConfirmDisabled}
            style={{ flex: 1 }}
          />
        </Box>
      </Stack>
    </AppModal>
  );
};

export default LocationChangeModal;

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  noteGroup: {
    gap: 6,
  },
});
