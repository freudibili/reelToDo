import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

const OptionPill: React.FC<Props> = ({ label, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  pillSelected: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  label: {
    color: "#0f172a",
    fontWeight: "600",
  },
  labelSelected: {
    color: "#fff",
  },
});

export default OptionPill;
