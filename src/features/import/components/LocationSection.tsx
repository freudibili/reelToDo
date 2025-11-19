import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import LocationAutocompleteInput, {
  type PlaceDetails,
} from "./LocationAutocompleteInput";

interface LocationSectionProps {
  locationName: string;
  address: string;
  confirmed: boolean;
  onChange: (values: { locationName: string; address: string }) => void;
  onSelectPlaceDetails?: (place: PlaceDetails) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  locationName,
  address,
  confirmed,
  onChange,
  onSelectPlaceDetails,
}) => {
  if (confirmed) {
    const formattedAddress = [locationName, address].filter(Boolean).join(", ");
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Location</Text>
        <Text style={styles.addressText}>{formattedAddress}</Text>
      </View>
    );
  }

  const handleSelectPlace = (place: PlaceDetails) => {
    console.log("Selected place:", place);
    onChange({
      locationName: place.name,
      address: place.formattedAddress,
    });
    if (onSelectPlaceDetails) {
      onSelectPlaceDetails(place);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Location</Text>

      <LocationAutocompleteInput
        value={address}
        onChangeValue={(value) => onChange({ locationName, address: value })}
        onSelectPlace={handleSelectPlace}
      />
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
  },
  addressText: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default LocationSection;
