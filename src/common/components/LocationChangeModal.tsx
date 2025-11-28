import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
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
  onSelectPlace: (place: PlaceDetails) => void;
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
  const isConfirmDisabled = !selectedPlace || submitting;
  const isCancelDisabled = submitting;

  useEffect(() => {
    if (!visible) {
      setSelectedPlace(null);
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
      <View style={styles.content}>
        <LocationAutocompleteInput
          initialValue={initialValue}
          onSelectPlace={(place) => {
            setSelectedPlace(place);
          }}
          placeholder={t("common:locationPicker.placeholder")}
        />

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: isCancelDisabled ? colors.card : colors.mutedSurface,
                borderColor: colors.border,
              },
            ]}
            onPress={onClose}
            disabled={isCancelDisabled}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: isCancelDisabled ? colors.secondaryText : colors.text,
                },
              ]}
            >
              {t("common:buttons.cancel")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.primaryButton,
              {
                backgroundColor:
                  selectedPlace && !submitting ? colors.accent : colors.overlay,
                borderColor: isConfirmDisabled ? colors.border : colors.accent,
              },
            ]}
            disabled={isConfirmDisabled}
            onPress={() => {
              if (selectedPlace) {
                onSelectPlace(selectedPlace);
              }
            }}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    selectedPlace && !submitting ? colors.accentText : colors.secondaryText,
                },
              ]}
            >
              {submitting
                ? t("common:locationPicker.submitting")
                : t("common:locationPicker.confirm")}
            </Text>
          </Pressable>
        </View>
      </View>
    </AppModal>
  );
};

export default LocationChangeModal;

const styles = StyleSheet.create({
  content: {
    gap: 14,
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
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
