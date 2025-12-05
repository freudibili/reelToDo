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

let cachedSettingsByUser: Record<string, SettingsStateData> = {};

const simulateLatency = async <T>(payload: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(payload), 150));

const cloneSettings = (settings: SettingsStateData): SettingsStateData => ({
  profile: { ...settings.profile },
  notifications: { ...settings.notifications },
  preferences: { ...settings.preferences },
});

const ensureUserSettings = (
  userId: string,
  email?: string
): SettingsStateData => {
  const existing = cachedSettingsByUser[userId];
  if (existing) {
    if (!existing.profile.email && email) {
      existing.profile.email = email;
    }
    return existing;
  }

  const seeded: SettingsStateData = {
    profile: {
      ...defaultSettingsState.profile,
      email: email ?? "",
    },
    notifications: {
      ...defaultSettingsState.notifications,
    },
    preferences: {
      ...defaultSettingsState.preferences,
    },
  };

  cachedSettingsByUser[userId] = seeded;
  return seeded;
};

export const settingsService = {
  async fetch(userId: string, email?: string): Promise<SettingsStateData> {
    const settings = ensureUserSettings(userId, email);
    const seededProfile: ProfileSettings = {
      ...settings.profile,
      email: settings.profile.email || email || `${userId}@example.com`,
    };

    cachedSettingsByUser[userId] = {
      ...settings,
      profile: seededProfile,
    };

    return simulateLatency(cloneSettings(cachedSettingsByUser[userId]));
  },

  async updateProfile(
    userId: string,
    profile: ProfileSettings
  ): Promise<ProfileSettings> {
    cachedSettingsByUser[userId] = {
      ...ensureUserSettings(userId, profile.email),
      profile: {
        ...profile,
      },
    };

    return simulateLatency({ ...cachedSettingsByUser[userId].profile });
  },

  async updateNotifications(
    userId: string,
    preferences: NotificationSettings
  ): Promise<NotificationSettings> {
    cachedSettingsByUser[userId] = {
      ...ensureUserSettings(userId),
      notifications: {
        ...preferences,
      },
    };
    return simulateLatency({ ...cachedSettingsByUser[userId].notifications });
  },

  async updatePreferences(
    userId: string,
    preferences: PreferenceSettings
  ): Promise<PreferenceSettings> {
    cachedSettingsByUser[userId] = {
      ...ensureUserSettings(userId),
      preferences: {
        ...preferences,
      },
    };
    return simulateLatency({ ...cachedSettingsByUser[userId].preferences });
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

  resetCache(userId?: string) {
    if (userId) {
      delete cachedSettingsByUser[userId];
      return;
    }
    cachedSettingsByUser = {};
  },
};
