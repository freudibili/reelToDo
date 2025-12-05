import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  label?: string | null;
  style?: ViewStyle;
  tone?: "default" | "muted";
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  labelWeight?: "bold" | "normal";
};

const DateBadge: React.FC<Props> = ({
  label,
  style,
  tone = "default",
  icon = "calendar-heart",
  iconColor,
  iconBackgroundColor,
  labelWeight = "bold",
}) => {
  const { colors, mode } = useAppTheme();

  if (!label) return null;

  const textColor =
    tone === "muted"
      ? colors.secondaryText
      : mode === "dark"
        ? colors.text
        : colors.text;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: iconBackgroundColor ?? colors.accentSurface },
        ]}
      >
        <Icon source={icon} size={16} color={iconColor ?? colors.accent} />
      </View>
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontWeight: labelWeight === "bold" ? "700" : "500",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

export default DateBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.12)",
  },
  label: {
    fontSize: 14,
  },
});
