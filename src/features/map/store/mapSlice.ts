import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MapState } from "../types";

const initialState: MapState = {
  selectedCategory: null,
  lastFocusedActivityId: null,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategory = action.payload;
    },
    setLastFocusedActivity(state, action: PayloadAction<string | null>) {
      state.lastFocusedActivityId = action.payload;
    },
  },
});

export const mapActions = mapSlice.actions;
export default mapSlice.reducer;
