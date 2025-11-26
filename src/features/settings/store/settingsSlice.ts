import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";
import { settingsService } from "../services/settingsService";
import {
  defaultNotifications,
  defaultPreferences,
  defaultProfile,
} from "../utils/constants";
import type {
  NotificationSettings,
  PreferenceSettings,
  ProfileSettings,
  SettingsStateData,
} from "../utils/types";

type SettingsState = SettingsStateData & {
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: SettingsState = {
  profile: defaultProfile,
  notifications: defaultNotifications,
  preferences: defaultPreferences,
  loading: false,
  error: null,
  initialized: false,
};

export const loadSettings = createAsyncThunk(
  "settings/loadSettings",
  async (
    payload: { userId: string; email?: string },
    { rejectWithValue }
  ) => {
    try {
      return await settingsService.fetch(payload.userId, payload.email);
    } catch {
      return rejectWithValue("settings:errors.load");
    }
  }
);

export const saveProfile = createAsyncThunk(
  "settings/saveProfile",
  async (payload: ProfileSettings, { rejectWithValue }) => {
    try {
      return await settingsService.updateProfile(payload);
    } catch {
      return rejectWithValue("settings:errors.profile");
    }
  }
);

export const saveNotifications = createAsyncThunk(
  "settings/saveNotifications",
  async (payload: NotificationSettings, { rejectWithValue }) => {
    try {
      return await settingsService.updateNotifications(payload);
    } catch {
      return rejectWithValue("settings:errors.notifications");
    }
  }
);

export const savePreferences = createAsyncThunk(
  "settings/savePreferences",
  async (payload: PreferenceSettings, { rejectWithValue }) => {
    try {
      return await settingsService.updatePreferences(payload);
    } catch {
      return rejectWithValue("settings:errors.preferences");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    hydrateProfileFromUser: (state, action: PayloadAction<User | null>) => {
      if (!action.payload) return;
      const metadata = action.payload.user_metadata as {
        full_name?: string;
        address?: string;
      };
      state.profile.fullName =
        state.profile.fullName || metadata?.full_name || action.payload.email;
      state.profile.email = state.profile.email || action.payload.email || "";
      state.profile.address = state.profile.address || metadata?.address || "";
    },
    setPreferencesLocally: (state, action: PayloadAction<PreferenceSettings>) => {
      state.preferences = action.payload;
    },
    setNotificationsLocally: (
      state,
      action: PayloadAction<NotificationSettings>
    ) => {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.profile = action.payload.profile;
        state.notifications = action.payload.notifications;
        state.preferences = action.payload.preferences;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "settings:errors.load";
      })
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "settings:errors.profile";
      })
      .addCase(saveNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(saveNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "settings:errors.notifications";
      })
      .addCase(savePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "settings:errors.preferences";
      });
  },
});

export const {
  hydrateProfileFromUser,
  setPreferencesLocally,
  setNotificationsLocally,
} = settingsSlice.actions;

export default settingsSlice.reducer;
