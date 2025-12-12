import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { startOfMonthIso, toDayKey } from "../utils/dates";

interface CalendarState {
  selectedDate: string; // YYYY-MM-DD
  visibleMonth: string; // ISO string at first day of month
}

const today = new Date();

const initialState: CalendarState = {
  selectedDate: toDayKey(today),
  visibleMonth: startOfMonthIso(today),
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setVisibleMonth(state, action: PayloadAction<string | Date>) {
      state.visibleMonth = startOfMonthIso(action.payload);
    },
    goToNextMonth(state) {
      const next = new Date(state.visibleMonth);
      next.setMonth(next.getMonth() + 1);
      state.visibleMonth = startOfMonthIso(next);
    },
    goToPreviousMonth(state) {
      const prev = new Date(state.visibleMonth);
      prev.setMonth(prev.getMonth() - 1);
      state.visibleMonth = startOfMonthIso(prev);
    },
    syncMonthToSelected(state) {
      state.visibleMonth = startOfMonthIso(state.selectedDate);
    },
  },
});

export const calendarActions = calendarSlice.actions;
export default calendarSlice.reducer;
