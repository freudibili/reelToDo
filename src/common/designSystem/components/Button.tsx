import React from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import {
  getShadowStyle,
  radii,
  spacing,
  type ShadowLevel,
  type TextVariant,
} from "../tokens";
import Text from "./Text";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "tonal"
  | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
  shadow?: ShadowLevel | false;
};

const sizeMap: Record<
  ButtonSize,
  { height: number; padding: number; gap: number; textVariant: TextVariant }
> = {
  sm: { height: 40, padding: spacing.md, gap: 8, textVariant: "bodyStrong" },
  md: { height: 46, padding: spacing.lg, gap: 10, textVariant: "headline" },
  lg: { height: 52, padding: spacing.xl, gap: 12, textVariant: "headline" },
};

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  pill = false,
  disabled,
  shadow = "md",
  style,
  ...rest
}) => {
  const { colors, mode } = useAppTheme();
  const config = sizeMap[size];

  const palette = getButtonPalette(variant, mode, colors);
  const textColor = palette.text;
  const content = (
    <View style={[styles.content, { gap: config.gap }]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant={config.textVariant}
        weight="700"
        tone={textColor === colors.text ? "default" : "inverse"}
        style={{ color: textColor }}
      >
        {label}
      </Text>
      {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
    </View>
  );

  const baseShadow = shadow ? (palette.shadow ?? shadow) : false;
  const borderWidth = palette.borderColor ? StyleSheet.hairlineWidth : 0;

  return (
    <Pressable
      style={(state) => {
        const { pressed } = state;
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;
        const pressedStyle =
          pressed && !disabled
            ? {
                transform: [{ translateY: 1 }],
                backgroundColor:
                  palette.pressedBackground ?? palette.background,
              }
            : undefined;

        return [
          styles.button,
          {
            height: config.height,
            paddingHorizontal: config.padding,
            backgroundColor: palette.background,
            borderColor: palette.borderColor,
            borderWidth,
            borderRadius: pill ? radii.pill : radii.md,
            opacity: disabled ? 0.55 : 1,
          },
          pressedStyle,
          fullWidth ? styles.fullWidth : undefined,
          baseShadow ? getShadowStyle(mode, baseShadow) : undefined,
          resolvedStyle,
        ];
      }}
      disabled={disabled || loading}
      hitSlop={8}
      android_ripple={{ color: palette.ripple }}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={textColor} /> : content}
    </Pressable>
  );
};

const getButtonPalette = (
  variant: ButtonVariant,
  mode: string,
  colors: ReturnType<typeof useAppTheme>["colors"]
) => {
  const overlay =
    mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  switch (variant) {
    case "secondary":
      return {
        background: colors.card,
        borderColor: colors.border,
        text: colors.text,
        ripple: overlay,
        shadow: "sm" as ShadowLevel,
      };
    case "outline":
      return {
        background: "transparent",
        borderColor: colors.border,
        text: colors.text,
        ripple: overlay,
      };
    case "ghost":
      return {
        background: "transparent",
        borderColor: undefined,
        text: colors.primary,
        pressedBackground: overlay,
        ripple: overlay,
      };
    case "tonal":
      return {
        background: colors.accentSurface,
        borderColor: colors.accentBorder,
        text: colors.accentText,
        ripple: overlay,
      };
    case "danger":
      return {
        background: colors.danger,
        borderColor: colors.danger,
        text: colors.favoriteContrast,
        ripple: overlay,
        shadow: "md" as ShadowLevel,
      };
    case "primary":
    default:
      return {
        background: colors.primary,
        borderColor: colors.primaryBorder,
        text: colors.favoriteContrast,
        pressedBackground: colors.primaryStrong,
        ripple: overlay,
        shadow: "md" as ShadowLevel,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    overflow: "hidden",
  },
  fullWidth: { width: "100%" },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    transform: [{ translateY: 0.5 }],
  },
});

export default Button;
