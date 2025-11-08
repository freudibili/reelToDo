import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@config/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ActivitiesService } from "../services/activitiesService";
import type { Activity } from "../utils/types";
import { AppDispatch, RootState } from "@core/store";

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
  // rows = [{ ...activityFields, is_favorite: true/false }, ...]

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
    return rejectWithValue("No user authenticated");
  }

  try {
    await ActivitiesService.deleteActivity(userId, id);
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Failed to delete");
  }

  return id;
});

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    activityInserted: (state, action: PayloadAction<Activity>) => {
      state.items = [action.payload, ...state.items];
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
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
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
          (payload) =>
            dispatch(
              favoriteToggledLocal((payload.new as any).activity_id as string)
            )
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "user_activities",
            filter: `user_id=eq.${userId}`,
          },
          (payload) =>
            dispatch(
              favoriteToggledLocal((payload.old as any).activity_id as string)
            )
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
