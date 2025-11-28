import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "@common/theme/appTheme";

interface ActionPillProps {
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  style?: ViewStyle;
  textStyle?: object;
}

const ActionPill: React.FC<ActionPillProps> = ({
  label,
  icon,
  iconColor,
  onPress,
  disabled,
  tone = "default",
  style,
  textStyle,
}) => {
  const { colors } = useAppTheme();
  const primaryColor = tone === "danger" ? colors.danger : colors.accent;
  const textColor = tone === "danger" ? colors.danger : colors.accentText;
  const backgroundColor =
    tone === "danger" ? styles.dangerBtn.backgroundColor : colors.accentSurface;
  const borderColor =
    tone === "danger" ? styles.dangerBtn.borderColor : colors.accentBorder;

  return (
    <Pressable
      style={[
        styles.actionBtn,
        {
          backgroundColor,
          borderColor,
        },
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
          color={iconColor ?? (disabled ? colors.secondaryText : primaryColor)}
        />
        <Text
          style={[
            styles.actionBtnText,
            { color: textColor },
            tone === "danger" && { color: colors.danger },
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

export default ActionPill;

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#e0f2fe",
    borderWidth: 1.5,
    borderColor: "#bae6fd",
    minWidth: 120,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtnText: {
    color: "#075985",
    fontWeight: "700",
    fontSize: 13,
  },
  dangerBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
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
