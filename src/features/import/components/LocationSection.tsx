import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import LocationAutocompleteInput from "./LocationAutocompleteInput";
import { PlaceDetails } from "../services/locationService";
import { useTranslation } from "react-i18next";

interface LocationSectionProps {
  locationName: string;
  address: string;
  confirmed: boolean;
  onChange: (place: PlaceDetails) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  locationName,
  address,
  confirmed,
  onChange,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  if (confirmed) {
    const formattedAddress = [locationName, address].filter(Boolean).join(", ");
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("import:locationSection.label")}
        </Text>
        <Text style={styles.addressText}>{formattedAddress}</Text>
      </View>
    );
  }

  const handleSelectPlace = (place: PlaceDetails) => {
    onChange(place);
    setEditing(false);
  };

  const hasAddress = !!address;
  const formattedAddress = [locationName, address].filter(Boolean).join(", ");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>
        {t("import:locationSection.label")}
      </Text>

      {!hasAddress ? (
        <>
          <Text style={styles.helperText}>
            {t("import:locationSection.notFound")}
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => setEditing(true)}>
            <Text style={styles.primaryBtnText}>
              {t("import:locationSection.edit")}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.helperText}>
            {t("import:locationSection.notAccurate")}
          </Text>
          <Text style={styles.previewText}>{formattedAddress}</Text>
          <Pressable style={styles.primaryBtn} onPress={() => setEditing(true)}>
            <Text style={styles.primaryBtnText}>
              {t("import:locationSection.edit")}
            </Text>
          </Pressable>
        </>
      )}

      {editing && (
        <View style={styles.locationContainer}>
          <LocationAutocompleteInput
            initialValue={address}
            onSelectPlace={handleSelectPlace}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    marginTop: 6,
  },
  helperText: {
    fontSize: 13,
    marginTop: 4,
  },
  previewText: {
    fontSize: 14,
    marginTop: 6,
  },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f2f2f2",
    alignSelf: "flex-start",
  },
  primaryBtnText: {
    fontSize: 14,
  },
  locationContainer: {
    marginTop: 12,
  },
});

export default LocationSection;
