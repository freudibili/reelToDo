import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@core/store";

const selectSlice = (state: RootState) => state.map;

const selectedCategory = createSelector(
  [selectSlice],
  (slice) => slice.selectedCategory
);

const lastFocusedActivityId = createSelector(
  [selectSlice],
  (slice) => slice.lastFocusedActivityId
);

export const mapSelectors = {
  selectedCategory,
  lastFocusedActivityId,
};
