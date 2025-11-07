import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@config/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Activity } from "../utils/types";

interface ActivitiesState {
  items: Activity[];
  loading: boolean;
  initialized: boolean;
}

const initialState: ActivitiesState = {
  items: [],
  loading: false,
  initialized: false,
};

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Activity[];
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/deleteActivity",
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

let activitiesChannel: RealtimeChannel | null = null;

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    activityInserted: (state, action: PayloadAction<Activity>) => {
      state.items = [action.payload, ...state.items];
    },
    activityDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActivities.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(fetchActivities.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    });
  },
});

export const { activityInserted, activityDeleted } = activitiesSlice.actions;
export default activitiesSlice.reducer;

export const startActivitiesListener =
  () =>
  (dispatch: any): void => {
    if (activitiesChannel) return;

    activitiesChannel = supabase
      .channel("public:activities")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        (payload) => {
          dispatch(activityInserted(payload.new as Activity));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "activities" },
        (payload) => {
          dispatch(activityDeleted((payload.old as Activity).id));
        }
      )
      .subscribe();
  };

export const stopActivitiesListener = () => {
  if (activitiesChannel) {
    supabase.removeChannel(activitiesChannel);
    activitiesChannel = null;
  }
};
