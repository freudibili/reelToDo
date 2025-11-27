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
    primary: string;
    text: string;
    mutedText: string;
    secondaryText: string;
    overlay: string;
    danger: string;
  };
};

const lightPalette: AppTheme["colors"] = {
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#f1f5f9",
  mutedSurface: "#eef2ff",
  border: "#e2e8f0",
  primary: "#0f172a",
  text: "#0f172a",
  mutedText: "#475569",
  secondaryText: "#94a3b8",
  overlay: "rgba(15,23,42,0.06)",
  danger: "#b91c1c",
};

const darkPalette: AppTheme["colors"] = {
  background: "#0b1220",
  surface: "#0f172a",
  card: "#111827",
  mutedSurface: "#0d1629",
  border: "#1f2937",
  primary: "#7dd3fc",
  text: "#e5e7eb",
  mutedText: "#cbd5e1",
  secondaryText: "#94a3b8",
  overlay: "rgba(255,255,255,0.08)",
  danger: "#f87171",
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
