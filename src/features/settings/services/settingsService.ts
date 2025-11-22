import {
  defaultSettingsState,
  distanceOptions,
  languageOptions,
  themeOptions,
} from "../utils/constants";
import type {
  NotificationSettings,
  PreferenceSettings,
  ProfileSettings,
  SettingsStateData,
} from "../utils/types";

let cachedSettings: SettingsStateData | null = null;

const simulateLatency = async <T>(payload: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(payload), 150));

export const settingsService = {
  async fetch(userId: string, email?: string): Promise<SettingsStateData> {
    if (!cachedSettings) {
      cachedSettings = {
        ...defaultSettingsState,
        profile: {
          ...defaultSettingsState.profile,
          email: email ?? "",
        },
        preferences: {
          ...defaultSettingsState.preferences,
        },
      };
    }

    const seededProfile: ProfileSettings = {
      ...cachedSettings.profile,
      email: cachedSettings.profile.email || email || `${userId}@example.com`,
    };

    cachedSettings = {
      ...cachedSettings,
      profile: seededProfile,
    };

    return simulateLatency(cachedSettings);
  },

  async updateProfile(profile: ProfileSettings): Promise<ProfileSettings> {
    cachedSettings = {
      ...(cachedSettings ?? defaultSettingsState),
      profile: {
        ...profile,
      },
    };
    return simulateLatency(cachedSettings.profile);
  },

  async updateNotifications(
    preferences: NotificationSettings
  ): Promise<NotificationSettings> {
    cachedSettings = {
      ...(cachedSettings ?? defaultSettingsState),
      notifications: {
        ...preferences,
      },
    };
    return simulateLatency(cachedSettings.notifications);
  },

  async updatePreferences(
    preferences: PreferenceSettings
  ): Promise<PreferenceSettings> {
    cachedSettings = {
      ...(cachedSettings ?? defaultSettingsState),
      preferences: {
        ...preferences,
      },
    };
    return simulateLatency(cachedSettings.preferences);
  },

  getDistanceLabel(value: PreferenceSettings["distanceUnit"]) {
    return distanceOptions.find((option) => option.value === value);
  },

  getThemeLabel(value: PreferenceSettings["theme"]) {
    return themeOptions.find((option) => option.value === value);
  },

  getLanguageLabel(value: PreferenceSettings["language"]) {
    return languageOptions.find((option) => option.value === value);
  },
};
