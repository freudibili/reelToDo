export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
}

export interface NotificationSettings {
  activityReminders: boolean;
  productNews: boolean;
  travelTips: boolean;
  privacyAlerts: boolean;
}

export type ThemePreference = "system" | "light" | "dark";
export type DistanceUnit = "km" | "mi";
export type LanguagePreference = "system" | "en" | "fr";

export interface PreferenceSettings {
  language: LanguagePreference;
  distanceUnit: DistanceUnit;
  theme: ThemePreference;
}

export interface SettingsStateData {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
}

export interface ProfileEmailRow {
  email: string | null;
}
