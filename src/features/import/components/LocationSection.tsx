import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { PlaceDetails } from "../services/locationService";
import { useTranslation } from "react-i18next";
import InfoRow from "@features/activities/components/InfoRow";
import { useAppTheme } from "@common/theme/appTheme";
import LocationChangeModal from "@common/components/LocationChangeModal";

interface LocationSectionProps {
  infoValue: string;
  locationName: string;
  address: string;
  confirmed: boolean;
  onChange: (place: PlaceDetails) => void;
  editRequest?: number;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  infoValue,
  locationName,
  address,
  confirmed,
  onChange,
  editRequest = 0,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const lastEditRequestRef = useRef(editRequest);
  const { colors, mode } = useAppTheme();

  const hasAddress = !!address;
  const needsConfirmation = !confirmed || !hasAddress;

  const handleSelectPlace = (place: PlaceDetails) => {
    onChange(place);
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
    <View
      style={[
        styles.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <InfoRow icon="map-marker" value={infoValue} />

      {needsConfirmation ? (
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          {hasAddress
            ? t("import:locationSection.notAccurate")
            : t("import:locationSection.notFound")}
        </Text>
      ) : (
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          {t("import:locationSection.confirmed")}
        </Text>
      )}

      <Pressable
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.primaryBtnText,
            { color: mode === "dark" ? colors.background : colors.surface },
          ]}
        >
          {t("import:locationSection.edit")}
        </Text>
      </Pressable>

      <LocationChangeModal
        visible={modalVisible}
        initialValue={address || locationName}
        onSelectPlace={handleSelectPlace}
        onClose={() => setModalVisible(false)}
        title={t("import:locationSection.modalTitle")}
        subtitle={t("import:locationSection.modalSubtitle")}
      />
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

export default LocationSection;
