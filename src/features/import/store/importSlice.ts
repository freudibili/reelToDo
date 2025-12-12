import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ShareIntent } from "expo-share-intent";
import {
  importService,
  markActivityDateConfirmed,
  markActivityLocationConfirmed,
  updateImportedActivityDetails,
} from "../services/importService";
import type { Activity } from "@features/activities/types";
import {
  activityInserted,
  activityUpdated,
} from "@features/activities/store/activitiesSlice";
import { AppDispatch, RootState } from "@core/store";
import type { UpdateActivityPayload } from "../types";
import i18next from "@common/i18n/i18n";

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
      let result = await importService.analyze({ shared, userId });

      if (!("user_id" in result) || !result.user_id) {
        const ownership = await importService.ensureOwner(result.id, userId);
        if (ownership?.user_id) {
          result = { ...result, user_id: ownership.user_id } as Activity;
        }
      }

      dispatch(activityInserted(result));

      return result as Activity;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : i18next.t("import:errors.analyze");
      return rejectWithValue(message);
    }
  }
);

export const restartImportProcessing = createAsyncThunk<
  Activity,
  { activityId: string; userId: string },
  { rejectValue: string }
>(
  "import/restartImportProcessing",
  async ({ activityId, userId }, { rejectWithValue }) => {
    try {
      return await importService.processActivity(activityId, userId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : i18next.t("import:errors.analyze");
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
  } catch {
    return rejectWithValue(i18next.t("import:errors.location"));
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
    } catch {
      return rejectWithValue(i18next.t("import:errors.date"));
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
            : i18next.t("import:errors.saveDetails");
      return rejectWithValue(message);
    }
  }
);

const importSlice = createSlice({
  name: "import",
  initialState,
  reducers: {
    resetImport: (): ImportState => initialState,
    setImportActivity: (state, action: PayloadAction<Activity | null>) => {
      state.activity = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
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
        state.error = action.payload ?? i18next.t("import:errors.analyze");
      })
      .addCase(restartImportProcessing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restartImportProcessing.fulfilled, (state, action) => {
        state.loading = false;
        state.activity = action.payload;
      })
      .addCase(restartImportProcessing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? i18next.t("import:errors.analyze");
      })
      .addCase(confirmImportedLocation.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.activity = action.payload;
        state.error = null;
      })
      .addCase(confirmImportedLocation.rejected, (state, action) => {
        state.error = action.payload || i18next.t("import:errors.location");
      })
      .addCase(confirmImportedDate.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.activity = action.payload;
        state.error = null;
      })
      .addCase(confirmImportedDate.rejected, (state, action) => {
        state.error = action.payload || i18next.t("import:errors.date");
      })
      .addCase(saveImportedActivityDetails.fulfilled, (state, action) => {
        state.importedActivity = action.payload;
        state.activity = action.payload;
        state.error = null;
      })
      .addCase(saveImportedActivityDetails.rejected, (state, action) => {
        state.error = action.payload || i18next.t("import:errors.saveDetails");
      })
      .addCase(activityUpdated, (state, action) => {
        if (state.activity?.id === action.payload.id) {
          state.activity = action.payload;
        }
      })
      .addCase(activityInserted, (state, action) => {
        if (state.activity?.id === action.payload.id) {
          state.activity = action.payload;
        }
      });
  },
});

export const { resetImport, setImportActivity } = importSlice.actions;
export default importSlice.reducer;
