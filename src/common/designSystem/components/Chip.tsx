import React from "react";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import { radii, spacing } from "../tokens";
import Text from "./Text";

type ChipTone = "neutral" | "primary" | "accent" | "success" | "danger";

type Props = PressableProps & {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  tone?: ChipTone;
};

const Chip: React.FC<Props> = ({
  label,
  icon,
  selected = false,
  tone = "neutral",
  style,
  disabled,
  ...rest
}) => {
  const { colors } = useAppTheme();
  const palette = getPalette(tone, selected, colors);

  return (
    <Pressable
      style={(state) => {
        const { pressed } = state;
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;
        return [
          styles.container,
          {
            backgroundColor: palette.background,
            borderColor: palette.borderColor,
            opacity: disabled ? 0.5 : 1,
          },
          pressed && !disabled ? styles.pressed : undefined,
          resolvedStyle,
        ];
      }}
      android_ripple={{ color: palette.ripple }}
      disabled={disabled}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant="bodySmall"
        weight="700"
        style={{ color: palette.textColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default Chip;

const getPalette = (
  tone: ChipTone,
  selected: boolean,
  colors: ReturnType<typeof useAppTheme>["colors"]
) => {
  if (!selected) {
    return {
      background: colors.overlay,
      borderColor: "transparent",
      textColor: colors.text,
      ripple: colors.overlay,
    };
  }

  switch (tone) {
    case "primary":
      return {
        background: colors.primarySurface,
        borderColor: colors.primaryBorder,
        textColor: colors.primary,
        ripple: colors.primarySurface,
      };
    case "accent":
      return {
        background: colors.accentSurface,
        borderColor: colors.accentBorder,
        textColor: colors.accent,
        ripple: colors.accentSurface,
      };
    case "success":
      return {
        background: colors.secondarySurface,
        borderColor: colors.secondaryBorder,
        textColor: colors.secondary,
        ripple: colors.secondarySurface,
      };
    case "danger":
      return {
        background: "#fef2f2",
        borderColor: "#fecdd3",
        textColor: colors.danger,
        ripple: "#fde2e1",
      };
    case "neutral":
    default:
      return {
        background: colors.card,
        borderColor: colors.border,
        textColor: colors.text,
        ripple: colors.overlay,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  icon: {
    transform: [{ translateY: 0.5 }],
  },
  pressed: {
    transform: [{ translateY: 0.5 }],
  },
});
