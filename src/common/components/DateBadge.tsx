import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { Stack, Text } from "@common/designSystem";
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
  const { colors } = useAppTheme();

  if (!label) return null;

  const textTone = tone === "muted" ? "muted" : "default";
  const resolvedIconColor = iconColor ?? colors.accent;
  const resolvedIconBackground = iconBackgroundColor ?? colors.accentSurface;
  const fontWeight = labelWeight === "bold" ? "700" : "500";

  return (
    <Stack direction="row" align="center" gap="sm" style={[styles.container, style]}>
      <Stack
        align="center"
        justify="center"
        height={28}
        width={28}
        rounded="pill"
        background={resolvedIconBackground}
      >
        <Icon source={icon} size={16} color={resolvedIconColor} />
      </Stack>
      <Text variant="body" weight={fontWeight} tone={textTone} numberOfLines={1}>
        {label}
      </Text>
    </Stack>
  );
};

export default DateBadge;

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
});
