import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@config/supabase";
import { ActivitiesService } from "../services/activitiesService";
import { createCalendarEventForActivity } from "@features/calendar/services/calendarService";
import { Linking } from "react-native";
import type { Activity } from "../utils/types";
import type { AppDispatch, RootState } from "@core/store";
import i18next from "@common/i18n/i18n";

interface ActivitiesState {
  items: Activity[];
  favoriteIds: string[];
  loading: boolean;
  initialized: boolean;
}

const initialState: ActivitiesState = {
  items: [],
  favoriteIds: [],
  loading: false,
  initialized: false,
};

let activitiesChannel: RealtimeChannel | null = null;
let userActivitiesChannel: RealtimeChannel | null = null;

export const fetchActivities = createAsyncThunk<
  { activities: Activity[]; favorites: string[] },
  void,
  { dispatch: AppDispatch; state: RootState }
>("activities/fetchActivities", async (_, { getState }) => {
  const userId = getState().auth.user?.id ?? null;
  if (!userId) {
    return { activities: [], favorites: [] };
  }

  const rows = await ActivitiesService.fetchActivities(userId);

  const activities: Activity[] = rows.map((row: any) => {
    const { is_favorite, ...rest } = row;
    return rest as Activity;
  });

  const favorites = rows
    .filter((row: any) => row.is_favorite)
    .map((row: any) => row.id as string);

  return { activities, favorites };
});

export const addFavorite = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("activities/addFavorite", async (activityId, { getState }) => {
  const userId = getState().auth.user?.id;
  if (!userId) return activityId;
  await ActivitiesService.addFavorite(userId, activityId);
  return activityId;
});

export const removeFavorite = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("activities/removeFavorite", async (activityId, { getState }) => {
  const userId = getState().auth.user?.id;
  if (!userId) return activityId;
  await ActivitiesService.removeFavorite(userId, activityId);
  return activityId;
});

export const deleteActivity = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("activities/deleteActivity", async (id, { getState, rejectWithValue }) => {
  const userId = getState().auth.user?.id;
  if (!userId) {
    return rejectWithValue(i18next.t("activities:errors.noUser"));
  }
  try {
    await ActivitiesService.deleteActivity(userId, id);
  } catch (e: any) {
    return rejectWithValue(
      e.message ?? i18next.t("activities:errors.deleteFailed")
    );
  }
  return id;
});

export const cancelActivity = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("activities/cancelActivity", async (id, { getState, rejectWithValue }) => {
  const userId = getState().auth.user?.id;
  if (!userId) {
    return rejectWithValue(i18next.t("activities:errors.noUser"));
  }
  try {
    await ActivitiesService.cancelActivity(userId, id);
  } catch (e: any) {
    return rejectWithValue(
      e.message ?? i18next.t("activities:errors.deleteFailed")
    );
  }
  return id;
});

export const createActivityCalendarEvent = createAsyncThunk<
  { activityId: string; calendarEventId: string },
  {
    activityId: string;
    activityDate?: { id?: string; start: string | Date; end?: string | Date };
  },
  { state: RootState; rejectValue: string }
>(
  "activities/createActivityCalendarEvent",
  async ({ activityId, activityDate }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue(i18next.t("activities:errors.noUser"));
    }

    const activity = getState().activities.items.find(
      (a) => a.id === activityId
    );
    if (!activity) {
      return rejectWithValue(i18next.t("activities:errors.notFound"));
    }

    const eventId = await createCalendarEventForActivity(
      userId,
      activity,
      activityDate
    );
    if (!eventId) {
      return rejectWithValue(
        i18next.t("activities:errors.calendarCreateFailed")
      );
    }

    return { activityId, calendarEventId: eventId };
  }
);

export const openActivityInMaps = createAsyncThunk<
  void,
  string,
  { state: RootState }
>("activities/openActivityInMaps", async (activityId, { getState }) => {
  const { activities } = getState();
  const activity = activities.items.find((a) => a.id === activityId);
  if (!activity) return;

  if (activity.latitude && activity.longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
    Linking.openURL(url);
    return;
  }

  const query =
    activity.address ||
    activity.location_name ||
    activity.city ||
    activity.title;
  if (query) {
    const encoded = encodeURIComponent(query);
    const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    Linking.openURL(url);
  }
});

export const openActivitySource = createAsyncThunk<
  void,
  string,
  { state: RootState }
>("activities/openActivitySource", async (activityId, { getState }) => {
  const { activities } = getState();
  const activity = activities.items.find((a) => a.id === activityId);
  if (!activity?.source_url) return;
  Linking.openURL(activity.source_url);
});

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    activityInserted: (state, action: PayloadAction<Activity>) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items = [action.payload, ...state.items];
      }
    },
    activityUpdated: (state, action: PayloadAction<Activity>) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      }
    },
    activityDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== action.payload);
    },
    favoriteToggledLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteIds.includes(id)) {
        state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
      } else {
        state.favoriteIds.push(id);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActivities.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.items = action.payload.activities;
      state.favoriteIds = action.payload.favorites;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(fetchActivities.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(addFavorite.fulfilled, (state, action) => {
      const id = action.payload;
      if (!state.favoriteIds.includes(id)) {
        state.favoriteIds.push(id);
      }
    });
    builder.addCase(removeFavorite.fulfilled, (state, action) => {
      const id = action.payload;
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
    });
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((a) => a.id !== id);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
    });
    builder.addCase(cancelActivity.fulfilled, (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((a) => a.id !== id);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
    });
    builder.addCase(createActivityCalendarEvent.fulfilled, (state, action) => {
      const { activityId, calendarEventId } = action.payload;
      const idx = state.items.findIndex((a) => a.id === activityId);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          calendar_event_id: calendarEventId,
        } as Activity;
      }
    });
  },
});

export const {
  activityInserted,
  activityUpdated,
  activityDeleted,
  favoriteToggledLocal,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;

export const startActivitiesListener =
  (userId?: string | null) =>
  (dispatch: any): void => {
    if (!activitiesChannel) {
      activitiesChannel = supabase
        .channel("public:activities")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "activities" },
          (payload) => dispatch(activityInserted(payload.new as Activity))
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "activities" },
          (payload) => dispatch(activityUpdated(payload.new as Activity))
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "activities" },
          (payload) => dispatch(activityDeleted((payload.old as Activity).id))
        )
        .subscribe();
    }

    if (userId && !userActivitiesChannel) {
      userActivitiesChannel = supabase
        .channel("public:user_activities")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_activities",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new;
            if (row.is_favorite) {
              dispatch(favoriteToggledLocal(row.activity_id));
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "user_activities",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const oldRow = payload.old;
            dispatch(activityDeleted(oldRow.activity_id));
          }
        )
        .subscribe();
    }
  };

export const stopActivitiesListener = () => {
  if (activitiesChannel) {
    supabase.removeChannel(activitiesChannel);
    activitiesChannel = null;
  }
  if (userActivitiesChannel) {
    supabase.removeChannel(userActivitiesChannel);
    userActivitiesChannel = null;
  }
};
