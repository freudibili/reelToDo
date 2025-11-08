import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ShareIntent } from "expo-share-intent";
import { importService } from "../services/importService";
import type { Activity } from "@features/activities/utils/types";

export interface ImportState {
  loading: boolean;
  error: string | null;
  activity: Activity | null;
}

const initialState: ImportState = {
  loading: false,
  error: null,
  activity: null,
};

export const analyzeSharedLink = createAsyncThunk<
  Activity,
  { shared: ShareIntent; userId: string },
  { rejectValue: string }
>(
  "import/analyzeSharedLink",
  async ({ shared, userId }, { rejectWithValue }) => {
    try {
      const result = await importService.analyze({ shared, userId });
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
      });
  },
});

export const { resetImport } = importSlice.actions;
export default importSlice.reducer;
