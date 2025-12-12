import { supabase } from "@config/supabase";
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

const cachedSettingsByUser: Record<string, SettingsStateData> = {};

const mapProfile = (
  profile: Pick<
    ProfileSettings,
    "firstName" | "lastName" | "email" | "address"
  >
): ProfileSettings => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  email: profile.email ?? "",
  address: profile.address ?? "",
});

const ensureUserSettings = (userId: string): SettingsStateData => {
  if (!cachedSettingsByUser[userId]) {
    cachedSettingsByUser[userId] = {
      profile: { ...defaultSettingsState.profile },
      notifications: { ...defaultSettingsState.notifications },
      preferences: { ...defaultSettingsState.preferences },
    };
  }
  return cachedSettingsByUser[userId];
};

const simulateLatency = async <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 10));

export const settingsService = {
  async fetch(userId: string, email?: string): Promise<SettingsStateData> {
    const { data, error } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, address")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    let profile: ProfileSettings = mapProfile({
      firstName: data?.first_name ?? "",
      lastName: data?.last_name ?? "",
      email: data?.email || email || "",
      address: data?.address ?? "",
    });

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            email: email ?? "",
          },
          { onConflict: "user_id" }
        )
        .select("email, first_name, last_name, address")
        .single();

      if (insertError) throw insertError;
      profile = mapProfile({
        firstName: inserted.first_name ?? "",
        lastName: inserted.last_name ?? "",
        email: inserted.email || email || "",
        address: inserted.address ?? "",
      });
    }

    return {
      profile,
      notifications: { ...ensureUserSettings(userId).notifications },
      preferences: { ...ensureUserSettings(userId).preferences },
    };
  },

  async updateProfile(
    userId: string,
    profile: ProfileSettings
  ): Promise<ProfileSettings> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          email: profile.email,
          first_name: profile.firstName || null,
          last_name: profile.lastName || null,
          address: profile.address || null,
        },
        { onConflict: "user_id" }
      )
      .select("email, first_name, last_name, address")
      .single();

    if (error) throw error;

    return mapProfile({
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email ?? profile.email,
      address: data.address ?? "",
    });
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

  resetCache() {
    // No local cache to clear now that data is fetched from Supabase.
  },
};
