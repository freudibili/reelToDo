import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

interface LocationSectionProps {
  locationName: string;
  city: string;
  locked: boolean;
  confirmed: boolean;
  onChangeLocationName: (value: string) => void;
  onChangeCity: (value: string) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  locationName,
  city,
  locked,
  confirmed,
  onChangeLocationName,
  onChangeCity,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Location</Text>

      <TextInput
        style={[styles.input, locked && styles.inputDisabled]}
        value={locationName}
        onChangeText={onChangeLocationName}
        placeholder="Place name"
        editable={!locked}
      />

      <TextInput
        style={[styles.input, locked && styles.inputDisabled]}
        value={city}
        onChangeText={onChangeCity}
        placeholder="City"
        editable={!locked}
      />

      {!confirmed ? (
        <Text style={styles.warning}>⚠️ Needs location</Text>
      ) : locked ? (
        <Text style={styles.success}>✓ Location confirmed</Text>
      ) : (
        <Text style={styles.success}>✓ Location ready to save</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: "#f2f2f2",
  },
  warning: {
    marginTop: 4,
    fontSize: 13,
    color: "#d9534f",
  },
  success: {
    marginTop: 4,
    fontSize: 13,
    color: "#2ecc71",
  },
});

export default LocationSection;
