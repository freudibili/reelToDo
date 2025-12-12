import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "../../theme/appTheme";
import { radii, spacing } from "../tokens";
import Text from "./Text";

type MessageTone = "info" | "danger" | "success" | "neutral";

type Props = {
  title?: string;
  description?: string;
  tone?: MessageTone;
  icon?: React.ReactNode | string;
  children?: React.ReactNode;
};

const defaultIcons: Record<MessageTone, string> = {
  info: "information-outline",
  danger: "alert",
  success: "check-circle",
  neutral: "bell-outline",
};

const InlineMessage: React.FC<Props> = ({
  title,
  description,
  tone = "info",
  icon,
  children,
}) => {
  const { colors, mode } = useAppTheme();
  const palette = getPalette(tone, colors, mode);
  const resolvedIcon = icon ?? defaultIcons[tone];

  const renderIcon = () =>
    typeof resolvedIcon === "string" ? (
      <Icon source={resolvedIcon} size={18} color={palette.text} />
    ) : (
      resolvedIcon
    );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.icon}>{renderIcon()}</View>
      <View style={styles.content}>
        {title ? (
          <Text variant="headline" weight="700" style={{ color: palette.text }}>
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text variant="bodySmall" tone="muted" style={{ color: palette.text }}>
            {description}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
};

export default InlineMessage;

const getPalette = (tone: MessageTone, colors: ReturnType<typeof useAppTheme>["colors"], mode: string) => {
  switch (tone) {
    case "danger":
      return {
        background: colors.dangerSurface,
        border: colors.danger,
        text: colors.danger,
      };
    case "success":
      return {
        background: mode === "dark" ? colors.mutedSurface : colors.secondarySurface,
        border: colors.secondaryBorder,
        text: colors.secondary,
      };
    case "neutral":
      return {
        background: mode === "dark" ? colors.mutedSurface : colors.overlay,
        border: colors.border,
        text: colors.text,
      };
    case "info":
    default:
      return {
        background: mode === "dark" ? colors.mutedSurface : colors.accentSurface,
        border: colors.accentBorder,
        text: colors.accent,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  icon: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
});
