import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface LocationSectionProps {
  locationName: string;
  address: string;
  confirmed: boolean;
  onChange: (values: { locationName: string; address: string }) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  locationName,
  address,
  confirmed,
  onChange,
}) => {
  const formattedAddress = [locationName, address].filter(Boolean).join(", ");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Location</Text>

      {confirmed ? (
        <Text style={styles.addressText}>{formattedAddress}</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={(value) => onChange({ locationName: value, address })}
            placeholder="Place name"
          />

          <TextInput
            style={styles.input}
            value={address}
            onChangeText={(value) => onChange({ locationName, address: value })}
            placeholder="Address"
          />
        </>
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
  addressText: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default LocationSection;
