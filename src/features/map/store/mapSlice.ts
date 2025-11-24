import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
  selectedCategory: string | null;
  lastFocusedActivityId: string | null;
}

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
