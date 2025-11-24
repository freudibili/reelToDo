import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";

const selectSlice = (state: RootState) => state.calendar;

const selectedDate = createSelector([selectSlice], (slice) => slice.selectedDate);
const visibleMonth = createSelector([selectSlice], (slice) => slice.visibleMonth);
const visibleMonthDate = createSelector(
  [visibleMonth],
  (iso) => new Date(iso)
);
const monthPrefix = createSelector([visibleMonth], (iso) => iso.slice(0, 7));

export const calendarSelectors = {
  selectedDate,
  visibleMonth,
  visibleMonthDate,
  monthPrefix,
};
