import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";
import type { RootState } from "@core/store";
import { signOut, setSession } from "@features/auth/store/authSlice";
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
  userId: string | null;
};

const createInitialState = (): SettingsState => ({
  profile: { ...defaultProfile },
  notifications: { ...defaultNotifications },
  preferences: { ...defaultPreferences },
  loading: false,
  error: null,
  initialized: false,
  userId: null,
});

const initialState: SettingsState = createInitialState();

const staleSettingsRequest = "settings:stale";

export const loadSettings = createAsyncThunk<
  SettingsStateData,
  { userId: string; email?: string },
  { state: RootState; rejectValue: string }
>("settings/loadSettings", async (payload, { getState, rejectWithValue }) => {
  try {
    const result = await settingsService.fetch(payload.userId, payload.email);
    const currentUserId = (getState() as RootState).auth.user?.id;
    if (currentUserId !== payload.userId) {
      return rejectWithValue(staleSettingsRequest);
    }
    return result;
  } catch {
    return rejectWithValue("settings:errors.load");
  }
});

export const saveProfile = createAsyncThunk<
  ProfileSettings,
  ProfileSettings,
  { state: RootState; rejectValue: string }
>("settings/saveProfile", async (payload, { getState, rejectWithValue }) => {
  const userId = (getState() as RootState).auth.user?.id;
  if (!userId) {
    return rejectWithValue("settings:errors.profile");
  }

  try {
    return await settingsService.updateProfile(userId, payload);
  } catch {
    return rejectWithValue("settings:errors.profile");
  }
});

export const saveNotifications = createAsyncThunk<
  NotificationSettings,
  NotificationSettings,
  { state: RootState; rejectValue: string }
>("settings/saveNotifications", async (payload, { getState, rejectWithValue }) => {
  const userId = (getState() as RootState).auth.user?.id;
  if (!userId) {
    return rejectWithValue("settings:errors.notifications");
  }

  try {
    return await settingsService.updateNotifications(userId, payload);
  } catch {
    return rejectWithValue("settings:errors.notifications");
  }
});

export const savePreferences = createAsyncThunk<
  PreferenceSettings,
  PreferenceSettings,
  { state: RootState; rejectValue: string }
>("settings/savePreferences", async (payload, { getState, rejectWithValue }) => {
  const userId = (getState() as RootState).auth.user?.id;
  if (!userId) {
    return rejectWithValue("settings:errors.preferences");
  }

  try {
    return await settingsService.updatePreferences(userId, payload);
  } catch {
    return rejectWithValue("settings:errors.preferences");
  }
});

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
        state.userId = action.meta.arg.userId;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false;
        if (action.payload === staleSettingsRequest) {
          return;
        }
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
      })
      .addCase(signOut.fulfilled, () => createInitialState())
      .addCase(setSession, (state, action) => {
        const nextUserId = action.payload.user?.id ?? null;
        if (nextUserId !== state.userId) {
          return createInitialState();
        }
      });
  },
});

export const {
  hydrateProfileFromUser,
  setPreferencesLocally,
  setNotificationsLocally,
} = settingsSlice.actions;

export default settingsSlice.reducer;
