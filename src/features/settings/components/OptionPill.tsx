import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

const OptionPill: React.FC<Props> = ({ label, selected = false, onPress }) => {
  const { colors, mode } = useAppTheme();
  const selectedTextColor = mode === "dark" ? "#0b1220" : "#ffffff";

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? selectedTextColor : colors.text },
        ]}
      >
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
  },
  label: {
    fontWeight: "600",
  },
});

export default OptionPill;
