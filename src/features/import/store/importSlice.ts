import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ShareIntent } from "expo-share-intent";
import {
  importService,
  markActivityDateConfirmed,
  markActivityLocationConfirmed,
  updateImportedActivityDetails,
} from "../services/importService";
import type { Activity } from "@features/activities/utils/types";
import {
  activityInserted,
  activityUpdated,
} from "@features/activities/store/activitiesSlice";
import { AppDispatch, RootState } from "@core/store";
import { UpdateActivityPayload } from "../utils/types";

export interface ImportState {
  loading: boolean;
  error: string | null;
  activity: Activity | null;
  importedActivity: Activity | null;
}

const initialState: ImportState = {
  loading: false,
  error: null,
  activity: null,
  importedActivity: null,
};

export const analyzeSharedLink = createAsyncThunk<
  Activity,
  { shared: ShareIntent; userId: string },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  "import/analyzeSharedLink",
  async ({ shared, userId }, { rejectWithValue, dispatch }) => {
    try {
      const result = await importService.analyze({ shared, userId });

      dispatch(activityInserted(result));

      return result as Activity;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unable to analyze link";
      return rejectWithValue(message);
    }
  }
);

export const confirmImportedLocation = createAsyncThunk<
  Activity,
  string,
  { rejectValue: string }
>("import/confirmImportedLocation", async (activityId, { rejectWithValue }) => {
  try {
    const updated = await markActivityLocationConfirmed(activityId);
    return updated;
  } catch (error) {
    return rejectWithValue("Failed to confirm location");
  }
});

export const confirmImportedDate = createAsyncThunk<
  Activity,
  { activityId: string; date: string },
  { rejectValue: string }
>(
  "import/confirmImportedDate",
  async ({ activityId, date }, { rejectWithValue }) => {
    try {
      const updated = await markActivityDateConfirmed(activityId, date);
      return updated;
    } catch (error) {
      return rejectWithValue("Failed to confirm date");
    }
  }
);

export const saveImportedActivityDetails = createAsyncThunk<
  Activity,
  {
    activityId: string;
  } & UpdateActivityPayload,
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  "import/saveImportedActivityDetails",
  async ({ activityId, location, dateIso }, { rejectWithValue, dispatch }) => {
    try {
      const result = await updateImportedActivityDetails(activityId, {
        location,
        dateIso,
      });

      dispatch(activityUpdated(result));

      return result as Activity;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unable to save activity details";
      return rejectWithValue(message);
    }
  }
);

const importSlice = createSlice({
  name: "import",
  initialState,
  reducers: {
    resetImport: (): ImportState => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeSharedLink.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activity = null;
      })
      .addCase(analyzeSharedLink.fulfilled, (state, action) => {
        state.loading = false;
        state.activity = action.payload;
      })
      .addCase(analyzeSharedLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to analyze link";
      })
      .addCase(confirmImportedLocation.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.error = null;
      })
      .addCase(confirmImportedLocation.rejected, (state, action) => {
        state.error = action.payload || "Failed to confirm location";
      })
      .addCase(confirmImportedDate.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.error = null;
      })
      .addCase(confirmImportedDate.rejected, (state, action) => {
        state.error = action.payload || "Failed to confirm date";
      })
      .addCase(saveImportedActivityDetails.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.error = null;
      })
      .addCase(saveImportedActivityDetails.rejected, (state, action) => {
        state.error = action.payload || "Failed to save activity details";
      });
  },
});

export const { resetImport } = importSlice.actions;
export default importSlice.reducer;
