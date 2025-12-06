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
    danger: string;
    plannedDate: string;
    plannedDateBackground: string;
    officialDate: string;
    officialDateBackground: string;
  };
};

const lightPalette: AppTheme["colors"] = {
  // Base surfaces
  background: "#F5F7FB",
  surface: "#FFFFFF",
  card: "#EDF1F8",
  mutedSurface: "#E4E8F2",
  border: "#D2D8E5",

  // Accent (kept in sync with primary for now)
  accent: "#4B6CB7",
  accentStrong: "#3F5BA1",
  accentSurface: "#E8EDFF",
  accentBorder: "#C7D2F5",
  accentText: "#111827",

  // Primary brand (soft indigo)
  primary: "#4B6CB7",
  primaryStrong: "#3F5BA1",
  primarySurface: "#E8EDFF",
  primaryBorder: "#C7D2F5",
  primaryText: "#111827",

  // Secondary (muted teal)
  secondary: "#4CA5B8",
  secondarySurface: "#E3F3F6",
  secondaryBorder: "#BEDFE6",

  // Specials
  favorite: "#D55A5A", // softer than pure red
  favoriteContrast: "#FFFFFF",

  // Text
  text: "#111827",
  mutedText: "#4B5563",
  secondaryText: "#9CA3AF",

  // Other
  overlay: "rgba(15,23,42,0.04)",
  danger: "#E26A6A",

  // Dates (very light backgrounds, low intensity)
  plannedDate: "#4B6CB7",
  plannedDateBackground: "#E8EDFF",
  officialDate: "#4CA5B8",
  officialDateBackground: "#E3F3F6",
};

// 🌚 DARK – desaturated, less contrasty, no neon
const darkPalette: AppTheme["colors"] = {
  // Base surfaces
  background: "#050814",
  surface: "#090F1E",
  card: "#0D1424",
  mutedSurface: "#11182A",
  border: "#222B3F",

  // Accent (same family as primary)
  accent: "#9BB4F3",
  accentStrong: "#7F99E0",
  accentSurface: "rgba(155,180,243,0.18)",
  accentBorder: "rgba(155,180,243,0.45)",
  accentText: "#E9EDFF",

  // Primary brand (soft, dusty blue)
  primary: "#9BB4F3",
  primaryStrong: "#7F99E0",
  primarySurface: "rgba(155,180,243,0.18)",
  primaryBorder: "rgba(155,180,243,0.45)",
  primaryText: "#E9EDFF",

  // Secondary (muted aqua)
  secondary: "#7BC7D4",
  secondarySurface: "rgba(123,199,212,0.18)",
  secondaryBorder: "rgba(123,199,212,0.45)",

  // Specials
  favorite: "#F4A6A6", // soft coral
  favoriteContrast: "#FFFFFF",

  // Text
  text: "#E5E7EB",
  mutedText: "#CBD5E1",
  secondaryText: "#9CA3AF",

  // Other
  overlay: "rgba(255,255,255,0.06)", // very subtle
  danger: "#F28B82",

  // Dates
  plannedDate: "#9BB4F3",
  plannedDateBackground: "#111B36",
  officialDate: "#7BC7D4",
  officialDateBackground: "#0E1F25",
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
