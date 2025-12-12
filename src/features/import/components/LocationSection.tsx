import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Button, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import LocationChangeModal from "@common/components/LocationChangeModal";
import type { PlaceDetails } from "../types";

type LocationSectionProps = {
  infoValue: string;
  locationName: string;
  address: string;
  confirmed: boolean;
  onChange: (place: PlaceDetails) => void;
  editRequest?: number;
  mode?: "edit" | "suggest";
  onSuggest?: (payload: {
    place: PlaceDetails;
    note: string | null;
  }) => Promise<void> | void;
  submitting?: boolean;
  activityTitle?: string;
};

const LocationSection: React.FC<LocationSectionProps> = ({
  infoValue,
  locationName,
  address,
  confirmed,
  onChange,
  editRequest = 0,
  mode: sectionMode = "edit",
  onSuggest,
  submitting = false,
  activityTitle,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const lastEditRequestRef = useRef(editRequest);
  const { colors } = useAppTheme();

  const hasAddress = !!address;
  const isSuggestMode = sectionMode === "suggest";
  const needsConfirmation = !confirmed || !hasAddress;

  const handleSelectPlace = async (payload: {
    place: PlaceDetails;
    note: string | null;
  }) => {
    if (isSuggestMode) {
      if (onSuggest) {
        try {
          await onSuggest(payload);
          setModalVisible(false);
        } catch {
          // Keep modal open so the user can try again.
        }
      }
      return;
    }

    onChange(payload.place);
    setModalVisible(false);
  };

  useEffect(() => {
    if (editRequest !== lastEditRequestRef.current) {
      setModalVisible(true);
      lastEditRequestRef.current = editRequest;
    }
  }, [editRequest]);

  useEffect(() => {
    setModalVisible(false);
  }, [locationName, address, confirmed]);

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
          <Icon source="map-marker" size={20} color={colors.primary} />
          <Stack gap="xxs">
            <Text variant="headline" weight="700">
              {t("import:locationSection.label")}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {infoValue}
            </Text>
          </Stack>
        </Stack>

        <Text variant="bodySmall" tone="muted">
          {!hasAddress
            ? t("import:locationSection.notFound")
            : isSuggestMode
              ? t("import:locationSection.suggestHelper")
              : needsConfirmation
                ? t("import:locationSection.notAccurate")
                : t("import:locationSection.confirmed")}
        </Text>

        <Button
          label={
            isSuggestMode
              ? t("activities:details.reportLocation")
              : t("import:locationSection.edit")
          }
          onPress={() => setModalVisible(true)}
          variant={isSuggestMode ? "secondary" : "primary"}
          icon={
            <Icon
              source={isSuggestMode ? "map-marker-question" : "pencil"}
              size={18}
              color={isSuggestMode ? colors.primary : colors.favoriteContrast}
            />
          }
          shadow="sm"
        />
      </Stack>

      <LocationChangeModal
        visible={modalVisible}
        initialValue={isSuggestMode ? undefined : address || locationName}
        onSelectPlace={handleSelectPlace}
        onClose={() => setModalVisible(false)}
        submitting={submitting}
        title={
          isSuggestMode
            ? t("activities:report.title")
            : t("import:locationSection.modalTitle")
        }
        subtitle={
          isSuggestMode
            ? t("activities:report.subtitle", {
                title: activityTitle ?? t("common:labels.activity"),
              })
            : t("import:locationSection.modalSubtitle")
        }
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
});

export default LocationSection;
