import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

interface ActionPillProps {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  style?: ViewStyle;
  textStyle?: object;
}

const ActionPill: React.FC<ActionPillProps> = ({
  label,
  icon,
  onPress,
  disabled,
  tone = "default",
  style,
  textStyle,
}) => (
  <Pressable
    style={[
      styles.actionBtn,
      tone === "danger" && styles.dangerBtn,
      disabled && styles.disabled,
      style,
    ].filter(Boolean)}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={styles.actionContent}>
      <Icon
        source={icon}
        size={18}
        color={tone === "danger" ? "#b91c1c" : disabled ? "#94a3b8" : "#0f172a"}
      />
      <Text
        style={[
          styles.actionBtnText,
          tone === "danger" && styles.dangerBtnText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

export default ActionPill;

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 120,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtnText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  dangerBtn: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  dangerBtnText: {
    color: "#b91c1c",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#e5e7eb",
  },
});
