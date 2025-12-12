import React from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "../../theme/appTheme";
import { radii, type ShadowLevel } from "../tokens";

type IconButtonTone = "default" | "primary" | "danger" | "accent";
type IconButtonVariant = "ghost" | "filled" | "outline" | "subtle";

type Props = PressableProps & {
  icon: React.ReactNode | string;
  size?: number;
  variant?: IconButtonVariant;
  tone?: IconButtonTone;
  shadow?: ShadowLevel | false;
};

const IconButton: React.FC<Props> = ({
  icon,
  size = 40,
  variant = "ghost",
  tone = "default",
  shadow = false,
  style,
  ...rest
}) => {
  const { colors, mode } = useAppTheme();
  const palette = getPalette(variant, tone, mode, colors);

  const renderIcon = () =>
    typeof icon === "string" ? (
      <Icon source={icon} size={18} color={palette.tint} />
    ) : (
      <View style={styles.icon}>{icon}</View>
    );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          height: size,
          width: size,
          borderRadius: radii.lg,
          backgroundColor: pressed ? palette.pressedBackground : palette.background,
          borderColor: palette.borderColor,
          borderWidth: palette.borderColor ? StyleSheet.hairlineWidth : 0,
        },
        shadow ? palette.shadowStyle : undefined,
        style,
      ]}
      android_ripple={{ color: palette.ripple }}
      {...rest}
    >
      {renderIcon()}
    </Pressable>
  );
};

export default IconButton;

const getPalette = (
  variant: IconButtonVariant,
  tone: IconButtonTone,
  mode: string,
  colors: ReturnType<typeof useAppTheme>["colors"]
) => {
  const toneColor =
    tone === "danger"
      ? colors.danger
      : tone === "primary"
        ? colors.primary
        : tone === "accent"
          ? colors.accent
          : colors.text;
  const overlay = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  switch (variant) {
    case "filled":
      return {
        background: tone === "danger" ? colors.danger : colors.primarySurface ?? colors.accentSurface,
        pressedBackground: overlay,
        borderColor: "transparent",
        tint: tone === "danger" ? colors.favoriteContrast : colors.primaryText,
        ripple: overlay,
      };
    case "outline":
      return {
        background: "transparent",
        pressedBackground: overlay,
        borderColor: colors.border,
        tint: toneColor,
        ripple: overlay,
      };
    case "subtle":
      return {
        background: colors.overlay,
        pressedBackground: overlay,
        borderColor: "transparent",
        tint: toneColor,
        ripple: overlay,
      };
    case "ghost":
    default:
      return {
        background: "transparent",
        pressedBackground: overlay,
        borderColor: "transparent",
        tint: toneColor,
        ripple: overlay,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
