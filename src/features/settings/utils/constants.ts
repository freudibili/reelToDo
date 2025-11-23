import type {
  PreferenceSettings,
  NotificationSettings,
  ProfileSettings,
  SettingsStateData,
} from "./types";

export const defaultProfile: ProfileSettings = {
  fullName: "",
  email: "",
  address: "",
};

export const defaultNotifications: NotificationSettings = {
  activityReminders: true,
  productNews: false,
  travelTips: true,
  privacyAlerts: true,
};

export const defaultPreferences: PreferenceSettings = {
  language: "system",
  distanceUnit: "km",
  theme: "system",
};

export const defaultSettingsState: SettingsStateData = {
  profile: defaultProfile,
  notifications: defaultNotifications,
  preferences: defaultPreferences,
};

export const distanceOptions = [
  { value: "km", labelKey: "settings:preferences.distance.km" },
  { value: "mi", labelKey: "settings:preferences.distance.mi" },
] as const;

export const themeOptions = [
  { value: "system", labelKey: "settings:preferences.theme.system" },
  { value: "light", labelKey: "settings:preferences.theme.light" },
  { value: "dark", labelKey: "settings:preferences.theme.dark" },
] as const;

export const languageOptions = [
  { value: "system", labelKey: "settings:preferences.language.system" },
  { value: "en", labelKey: "settings:preferences.language.en" },
  { value: "fr", labelKey: "settings:preferences.language.fr" },
] as const;
