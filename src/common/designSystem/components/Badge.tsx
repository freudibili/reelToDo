import React from "react";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import { radii, spacing, type TextVariant } from "../tokens";
import Text from "./Text";

type BadgeTone = "neutral" | "primary" | "accent" | "success" | "danger";

type Props = {
  children: React.ReactNode;
  tone?: BadgeTone;
  muted?: boolean;
  icon?: React.ReactNode;
  variant?: TextVariant;
};

const Badge: React.FC<Props> = ({
  children,
  tone = "neutral",
  muted = false,
  icon,
  variant = "caption",
}) => {
  const { colors } = useAppTheme();
  const palette = getPalette(tone, muted, colors);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.background,
          borderColor: palette.borderColor,
        },
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant={variant}
        weight="700"
        style={{ color: palette.textColor }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
};

export default Badge;

const getPalette = (
  tone: BadgeTone,
  muted: boolean,
  colors: ReturnType<typeof useAppTheme>["colors"]
) => {
  const toneMap: Record<BadgeTone, { background: string; text: string; border: string }> = {
    neutral: { background: colors.card, text: colors.text, border: colors.border },
    primary: { background: colors.primarySurface, text: colors.primaryText, border: colors.primaryBorder },
    accent: { background: colors.accentSurface, text: colors.accentText, border: colors.accentBorder },
    success: { background: colors.secondarySurface, text: colors.secondary, border: colors.secondaryBorder },
    danger: { background: "#fef2f2", text: colors.danger, border: "#fecdd3" },
  };

  const base = toneMap[tone];
  if (muted) {
    return {
      background: base.background,
      textColor: base.text,
      borderColor: "transparent",
    };
  }

  return {
    background: base.background,
    textColor: base.text,
    borderColor: base.border,
  };
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs / 2,
    transform: [{ translateY: 0.2 }],
  },
});
