import React from "react";
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";
import type { StatusBarStyle } from "react-native";

export type AppThemeMode = "light" | "dark";

export type AppTheme = {
  mode: AppThemeMode;
  paper: MD3Theme;
  statusBarStyle: StatusBarStyle;
  colors: {
    background: string;
    surface: string;
    card: string;
    mutedSurface: string;
    border: string;
    accent: string;
    accentStrong: string;
    accentSurface: string;
    accentBorder: string;
    accentText: string;
    primary: string;
    primaryStrong: string;
    primarySurface: string;
    primaryBorder: string;
    primaryText: string;
    secondary: string;
    secondarySurface: string;
    secondaryBorder: string;
    favorite: string;
    favoriteContrast: string;
    text: string;
    mutedText: string;
    secondaryText: string;
    overlay: string;
    overlayStrong: string;
    backdrop: string;
    danger: string;
    dangerSurface: string;
    success: string;
    lightGray: string;
    plannedDate: string;
    plannedDateBackground: string;
    officialDate: string;
    officialDateBackground: string;
    gradientPrimaryStart: string;
    gradientPrimaryEnd: string;
    info: string;
  };
};

const lightPalette: AppTheme["colors"] = {
  // Gradient anchors
  gradientPrimaryStart: "#0097B2",
  gradientPrimaryEnd: "#7ED957",

  // Base surfaces (slightly tinted with teal)
  background: "#F4FBFC",
  surface: "#FFFFFF",
  card: "#EAF6F8",
  mutedSurface: "#DFF1F4",
  border: "#C6E3E8",

  // Primary (midpoint teal-green)
  primary: "#2FB59A",
  primaryStrong: "#239B83",
  primarySurface: "#E3F7F2",
  primaryBorder: "#BDE9DE",
  primaryText: "#0F172A",

  // Accent (cooler → closer to gradient start)
  accent: "#1FA3B8",
  accentStrong: "#17879A",
  accentSurface: "#E1F4F7",
  accentBorder: "#B9E4EC",
  accentText: "#0F172A",

  // Secondary (greener → closer to gradient end)
  secondary: "#6BCF7E",
  secondarySurface: "#EAF8EE",
  secondaryBorder: "#CDEFD7",

  // Specials
  favorite: "#E35D5D",
  favoriteContrast: "#FFFFFF",

  // Text
  text: "#0F172A",
  mutedText: "#475569",
  secondaryText: "#94A3B8",

  // Other
  overlay: "rgba(15,23,42,0.04)",
  overlayStrong: "rgba(15,23,42,0.16)",
  backdrop: "rgba(15,23,42,0.35)",
  lightGray: "#F1F5F9",
  danger: "#E35D5D",
  dangerSurface: "rgba(227,93,93,0.12)",
  success: "#6BCF7E",
  info: "#0097B2",

  // Dates
  plannedDate: "#2FB59A",
  plannedDateBackground: "#E3F7F2",
  officialDate: "#6BCF7E",
  officialDateBackground: "#EAF8EE",
};

// 🌚 DARK – deep teal base, no neon, calm green accents
const darkPalette: AppTheme["colors"] = {
  // Gradient anchors (same brand, darker context)
  gradientPrimaryStart: "#0097B2",
  gradientPrimaryEnd: "#7ED957",

  // Base surfaces (deep teal-blue)
  background: "#040D12",
  surface: "#07171E",
  card: "#0A1E26",
  mutedSurface: "#0E2630",
  border: "#1E3A44",

  // Primary (desaturated midpoint)
  primary: "#63C8B3",
  primaryStrong: "#4FB19E",
  primarySurface: "rgba(99,200,179,0.18)",
  primaryBorder: "rgba(99,200,179,0.45)",
  primaryText: "#E6FFFA",

  // Accent (cool teal)
  accent: "#4FBAD1",
  accentStrong: "#3CA2B7",
  accentSurface: "rgba(79,186,209,0.18)",
  accentBorder: "rgba(79,186,209,0.45)",
  accentText: "#E6FFFA",

  // Secondary (soft green)
  secondary: "#8ADFA0",
  secondarySurface: "rgba(138,223,160,0.18)",
  secondaryBorder: "rgba(138,223,160,0.45)",

  // Specials
  favorite: "#F19A9A",
  favoriteContrast: "#FFFFFF",

  // Text
  text: "#E5F4F7",
  mutedText: "#B6DDE3",
  secondaryText: "#89AEB6",

  // Other
  overlay: "rgba(255,255,255,0.06)",
  overlayStrong: "rgba(255,255,255,0.12)",
  backdrop: "rgba(4,13,18,0.65)",
  lightGray: "#122C35",
  danger: "#F19A9A",
  dangerSurface: "rgba(241,154,154,0.16)",
  success: "#8ADFA0",
  info: "#4FBAD1",

  // Dates
  plannedDate: "#63C8B3",
  plannedDateBackground: "#0E2A33",
  officialDate: "#8ADFA0",
  officialDateBackground: "#102E1C",
};

const buildPaperTheme = (mode: AppThemeMode): MD3Theme => {
  const base = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  const palette = mode === "dark" ? darkPalette : lightPalette;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      surface: palette.surface,
    },
  };
};

export const createAppTheme = (mode: AppThemeMode): AppTheme => {
  const palette = mode === "dark" ? darkPalette : lightPalette;

  return {
    mode,
    paper: buildPaperTheme(mode),
    statusBarStyle: mode === "dark" ? "light-content" : "dark-content",
    colors: palette,
  };
};

export const AppThemeContext = React.createContext<AppTheme>(
  createAppTheme("light")
);

export const useAppTheme = () => React.useContext(AppThemeContext);
