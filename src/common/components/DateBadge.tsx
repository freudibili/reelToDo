import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  label?: string | null;
  style?: ViewStyle;
  tone?: "default" | "muted";
};

const DateBadge: React.FC<Props> = ({ label, style, tone = "default" }) => {
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
      <View style={[styles.iconWrapper, { backgroundColor: colors.accentSurface }]}>
        <Icon source="calendar-heart" size={16} color={colors.accent} />
      </View>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
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
    fontWeight: "700",
  },
});
