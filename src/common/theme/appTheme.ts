import React from "react";
import {
  MD3DarkTheme,
  MD3LightTheme,
  type MD3Theme,
} from "react-native-paper";
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
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#f1f5f9",
  mutedSurface: "#eef2ff",
  border: "#e2e8f0",
  accent: "#0f172a",
  accentStrong: "#f97316",
  accentSurface: "#fff7ed",
  accentBorder: "#fed7aa",
  accentText: "#7c2d12",
  primary: "#0f172a",
  primaryStrong: "#2563eb",
  favorite: "#d64545",
  favoriteContrast: "#ffffff",
  text: "#0f172a",
  mutedText: "#475569",
  secondaryText: "#94a3b8",
  overlay: "rgba(15,23,42,0.06)",
  danger: "#b91c1c",
  plannedDate: "#0ea5e9",
  plannedDateBackground: "#e0f2fe",
  officialDate: "#ea580c",
  officialDateBackground: "#ffedd5",
};

const darkPalette: AppTheme["colors"] = {
  background: "#0b1220",
  surface: "#0f172a",
  card: "#111827",
  mutedSurface: "#0d1629",
  border: "#1f2937",
  accent: "#c084fc",
  accentStrong: "#fb923c",
  accentSurface: "rgba(249,115,22,0.22)",
  accentBorder: "rgba(251,146,60,0.65)",
  accentText: "#fff1dc",
  primary: "#7dd3fc",
  primaryStrong: "#38bdf8",
  favorite: "#f97070",
  favoriteContrast: "#0b1220",
  text: "#e5e7eb",
  mutedText: "#cbd5e1",
  secondaryText: "#94a3b8",
  overlay: "rgba(255,255,255,0.08)",
  danger: "#f87171",
  plannedDate: "#67e8f9",
  plannedDateBackground: "#082f3f",
  officialDate: "#fb923c",
  officialDateBackground: "#402312",
};

const buildPaperTheme = (mode: AppThemeMode): MD3Theme => {
  const base = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  const palette = mode === "dark" ? darkPalette : lightPalette;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: "#2563eb",
      secondary: "#22d3ee",
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
