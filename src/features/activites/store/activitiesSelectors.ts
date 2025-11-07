import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";

const selectActivitiesState = (state: RootState) => state.activities;

export const activitiesSelectors = {
  items: createSelector(selectActivitiesState, (state) => state.items),
  loading: createSelector(selectActivitiesState, (state) => state.loading),
  initialized: createSelector(
    selectActivitiesState,
    (state) => state.initialized
  ),
};
