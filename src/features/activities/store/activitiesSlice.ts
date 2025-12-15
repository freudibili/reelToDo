import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RealtimeChannel } from "@supabase/supabase-js";

import i18next from "@common/i18n/i18n";
import { supabase } from "@config/supabase";
import type { AppDispatch, RootState } from "@core/store";
import {
  deleteCalendarEvent,
  updateCalendarEventForActivity,
} from "@features/calendar/services/calendarService";
import { createActivityCalendarEvent } from "@features/calendar/store/calendarThunks";

import { ActivitiesService } from "../services/activitiesService";
import type { Activity } from "../types";


interface ActivitiesState {
  items: Activity[];
  favoriteIds: string[];
  loading: boolean;
  initialized: boolean;
  recentlyEmptiedCategory: string | null;
}

const initialState: ActivitiesState = {
  items: [],
  favoriteIds: [],
  loading: false,
  initialized: false,
  recentlyEmptiedCategory: null,
};

const normalizeCategoryKey = (value?: string | null) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.toLowerCase();
  }
  return "other";
};

type CategoryAwareState = Pick<
  ActivitiesState,
  "items" | "recentlyEmptiedCategory"
>;

const updateRecentlyEmptiedCategory = (
  state: CategoryAwareState,
  removedCategory?: string | null
) => {
  if (removedCategory === undefined) {
    return;
  }
  const categoryKey = normalizeCategoryKey(removedCategory);
  const hasRemaining = state.items.some(
    (activity) => normalizeCategoryKey(activity.category) === categoryKey
  );
  if (!hasRemaining) {
    state.recentlyEmptiedCategory = categoryKey;
  }
};

let activitiesChannel: RealtimeChannel | null = null;
let userActivitiesChannel: RealtimeChannel | null = null;
let activitiesListenerCount = 0;
let userActivitiesListenerCount = 0;
let userActivitiesChannelUserId: string | null = null;

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
    return { ...rest, is_favorite } as Activity;
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

  const activity = getState().activities.items.find((a) => a.id === id);
  const calendarEventId = activity?.calendar_event_id;
  if (calendarEventId) {
    try {
      await deleteCalendarEvent(calendarEventId);
    } catch (err) {
      console.warn("Failed to remove calendar event", err);
    }
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

  const activity = getState().activities.items.find((a) => a.id === id);
  const calendarEventId = activity?.calendar_event_id;
  if (calendarEventId) {
    try {
      await deleteCalendarEvent(calendarEventId);
    } catch (err) {
      console.warn("Failed to remove calendar event", err);
    }
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

export const setPlannedDate = createAsyncThunk<
  {
    activityId: string;
    plannedAt: string | null;
    isFavorite?: boolean;
    calendarEventId?: string | null;
  },
  { activityId: string; plannedAt: string | Date | null },
  { state: RootState; rejectValue: string }
>(
  "activities/setPlannedDate",
  async ({ activityId, plannedAt }, { getState, rejectWithValue }) => {
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

    const iso = plannedAt ? new Date(plannedAt).toISOString() : null;
    let nextCalendarEventId = activity.calendar_event_id ?? null;

    if (nextCalendarEventId) {
      try {
        if (iso) {
          const updatedEventId = await updateCalendarEventForActivity(
            nextCalendarEventId,
            activity,
            iso
          );
          if (updatedEventId) {
            nextCalendarEventId = updatedEventId;
          }
        } else {
          const deleted = await deleteCalendarEvent(nextCalendarEventId);
          if (deleted) {
            nextCalendarEventId = null;
          }
        }
      } catch (err) {
        console.warn("Failed to sync calendar event", err);
      }
    }

    try {
      const row = await ActivitiesService.setPlannedDate(
        userId,
        activityId,
        iso,
        { calendarEventId: nextCalendarEventId }
      );
      return {
        activityId,
        plannedAt: row?.planned_at ?? iso,
        isFavorite: row?.is_favorite ?? undefined,
        calendarEventId: row?.calendar_event_id ?? undefined,
      };
    } catch (e: any) {
      return rejectWithValue(
        e?.message ?? i18next.t("activities:errors.notFound")
      );
    }
  }
);

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
    activityPatched: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Activity> }>
    ) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload.changes,
        } as Activity;
      }
    },
    activityDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== action.payload);
    },
    favoriteToggledLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const now = new Date().toISOString();
      if (state.favoriteIds.includes(id)) {
        state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
        const idx = state.items.findIndex((a) => a.id === id);
        if (idx >= 0) {
          state.items[idx].favorited_at = null;
          state.items[idx].is_favorite = false;
        }
      } else {
        state.favoriteIds.push(id);
        const idx = state.items.findIndex((a) => a.id === id);
        if (idx >= 0) {
          state.items[idx].favorited_at = now;
          state.items[idx].is_favorite = true;
        }
      }
    },
    userActivityUpdated: (
      state,
      action: PayloadAction<{
        activityId: string;
        plannedAt?: string | null;
        isFavorite?: boolean;
        calendarEventId?: string | null;
        activityDateId?: string | null;
      }>
    ) => {
      const {
        activityId,
        plannedAt,
        isFavorite,
        calendarEventId,
        activityDateId,
      } = action.payload;
      const idx = state.items.findIndex((a) => a.id === activityId);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          planned_at:
            plannedAt !== undefined ? plannedAt : state.items[idx].planned_at,
          calendar_event_id:
            calendarEventId !== undefined
              ? calendarEventId
              : state.items[idx].calendar_event_id,
          activity_date_id:
            activityDateId !== undefined
              ? activityDateId
              : state.items[idx].activity_date_id,
          is_favorite:
            isFavorite !== undefined
              ? isFavorite
              : state.items[idx].is_favorite,
        } as Activity;
      }
      if (isFavorite === true) {
        if (!state.favoriteIds.includes(activityId)) {
          state.favoriteIds.push(activityId);
        }
      } else if (isFavorite === false) {
        state.favoriteIds = state.favoriteIds.filter((x) => x !== activityId);
      }
    },
    clearRecentlyEmptiedCategory: (state) => {
      state.recentlyEmptiedCategory = null;
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
      state.recentlyEmptiedCategory = null;
    });
    builder.addCase(fetchActivities.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(addFavorite.fulfilled, (state, action) => {
      const id = action.payload;
      const now = new Date().toISOString();
      if (!state.favoriteIds.includes(id)) {
        state.favoriteIds.push(id);
      }
      const idx = state.items.findIndex((a) => a.id === id);
      if (idx >= 0) {
        state.items[idx].is_favorite = true;
        state.items[idx].favorited_at = now;
      }
    });
    builder.addCase(removeFavorite.fulfilled, (state, action) => {
      const id = action.payload;
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
      const idx = state.items.findIndex((a) => a.id === id);
      if (idx >= 0) {
        state.items[idx].is_favorite = false;
        state.items[idx].favorited_at = null;
      }
    });
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      const id = action.payload;
      const removedActivity = state.items.find((a) => a.id === id);
      state.items = state.items.filter((a) => a.id !== id);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
      if (removedActivity) {
        updateRecentlyEmptiedCategory(state, removedActivity.category);
      }
    });
    builder.addCase(cancelActivity.fulfilled, (state, action) => {
      const id = action.payload;
      const removedActivity = state.items.find((a) => a.id === id);
      state.items = state.items.filter((a) => a.id !== id);
      state.favoriteIds = state.favoriteIds.filter((x) => x !== id);
      if (removedActivity) {
        updateRecentlyEmptiedCategory(state, removedActivity.category);
      }
    });
    builder.addCase(createActivityCalendarEvent.fulfilled, (state, action) => {
      const { activityId, calendarEventId, plannedAt } = action.payload;
      const idx = state.items.findIndex((a) => a.id === activityId);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          calendar_event_id: calendarEventId,
          planned_at:
            plannedAt !== undefined ? plannedAt : state.items[idx].planned_at,
        } as Activity;
      }
    });
    builder.addCase(setPlannedDate.fulfilled, (state, action) => {
      const { activityId, plannedAt, isFavorite, calendarEventId } =
        action.payload;
      const idx = state.items.findIndex((a) => a.id === activityId);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          planned_at: plannedAt,
          calendar_event_id:
            calendarEventId ?? state.items[idx].calendar_event_id,
          is_favorite:
            isFavorite !== undefined
              ? isFavorite
              : state.items[idx].is_favorite,
        } as Activity;
      }
      if (isFavorite === true) {
        if (!state.favoriteIds.includes(activityId)) {
          state.favoriteIds.push(activityId);
        }
      } else if (isFavorite === false) {
        state.favoriteIds = state.favoriteIds.filter((x) => x !== activityId);
      }
    });
  },
});

export const {
  activityInserted,
  activityUpdated,
  activityPatched,
  activityDeleted,
  favoriteToggledLocal,
  userActivityUpdated,
  clearRecentlyEmptiedCategory,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;

export const startActivitiesListener =
  (userId?: string | null) =>
  (dispatch: any): void => {
    activitiesListenerCount += 1;
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

    if (userId) {
      if (
        userActivitiesChannel &&
        userActivitiesChannelUserId &&
        userActivitiesChannelUserId !== userId
      ) {
        supabase.removeChannel(userActivitiesChannel);
        userActivitiesChannel = null;
        userActivitiesChannelUserId = null;
        userActivitiesListenerCount = 0;
      }

      if (!userActivitiesChannel) {
        userActivitiesChannel = supabase
          .channel(`public:user_activities:${userId}`)
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
              dispatch(
                userActivityUpdated({
                  activityId: row.activity_id,
                  plannedAt: row.planned_at,
                  isFavorite:
                    typeof row.is_favorite === "boolean"
                      ? row.is_favorite
                      : undefined,
                  calendarEventId: row.calendar_event_id ?? undefined,
                  activityDateId: row.activity_date_id ?? undefined,
                })
              );
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_activities",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const row = payload.new;
              dispatch(
                userActivityUpdated({
                  activityId: row.activity_id,
                  plannedAt: row.planned_at,
                  isFavorite:
                    typeof row.is_favorite === "boolean"
                      ? row.is_favorite
                      : undefined,
                  calendarEventId: row.calendar_event_id ?? undefined,
                  activityDateId: row.activity_date_id ?? undefined,
                })
              );
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
        userActivitiesChannelUserId = userId;
      }
      userActivitiesListenerCount += 1;
    }
  };

export const stopActivitiesListener = () => {
  if (activitiesListenerCount > 0) {
    activitiesListenerCount -= 1;
  }
  if (activitiesListenerCount === 0 && activitiesChannel) {
    supabase.removeChannel(activitiesChannel);
    activitiesChannel = null;
  }
  if (userActivitiesListenerCount > 0) {
    userActivitiesListenerCount -= 1;
  }
  if (userActivitiesListenerCount === 0 && userActivitiesChannel) {
    supabase.removeChannel(userActivitiesChannel);
    userActivitiesChannel = null;
    userActivitiesChannelUserId = null;
  }
};
