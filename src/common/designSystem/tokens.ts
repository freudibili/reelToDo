import { StyleSheet, type TextStyle } from "react-native";

import { type AppThemeMode } from "../theme/appTheme";

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export type SpacingValue = keyof typeof spacing | number | undefined;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export type RadiusValue = keyof typeof radii | number | undefined;

export type ShadowLevel = "sm" | "md" | "lg";

export type TextVariant =
  | "display"
  | "title1"
  | "title2"
  | "title3"
  | "headline"
  | "body"
  | "bodyStrong"
  | "bodySmall"
  | "caption"
  | "eyebrow";

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: "800" },
  title1: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  title2: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  title3: { fontSize: 17, lineHeight: 22, fontWeight: "700" },
  headline: { fontSize: 16, lineHeight: 21, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 20, fontWeight: "500" },
  bodyStrong: { fontSize: 15, lineHeight: 20, fontWeight: "700" },
  bodySmall: { fontSize: 13.5, lineHeight: 18, fontWeight: "500" },
  caption: { fontSize: 12.5, lineHeight: 16, fontWeight: "600" },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
};

export const resolveSpace = (value: SpacingValue) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return spacing[value] ?? 0;
};

export const resolveRadius = (value: RadiusValue) => {
  if (typeof value === "number") return value;
  if (!value) return undefined;
  return radii[value];
};

export const getShadowStyle = (mode: AppThemeMode, level: ShadowLevel = "md") => {
  const isDark = mode === "dark";
  const presets: Record<ShadowLevel, { opacity: number; radius: number; height: number; elevation: number }> = {
    sm: { opacity: isDark ? 0.18 : 0.08, radius: 6, height: 3, elevation: 2 },
    md: { opacity: isDark ? 0.22 : 0.1, radius: 10, height: 6, elevation: 4 },
    lg: { opacity: isDark ? 0.26 : 0.14, radius: 16, height: 10, elevation: 7 },
  };

  const preset = presets[level];

  return StyleSheet.create({
    shadow: {
      shadowColor: "#0f172a",
      shadowOpacity: preset.opacity,
      shadowRadius: preset.radius,
      shadowOffset: { width: 0, height: preset.height },
      elevation: preset.elevation,
    },
  }).shadow;
};
