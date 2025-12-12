import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@core/store";

const selectSlice = (state: RootState) => state.settings;

const selectProfile = createSelector([selectSlice], (slice) => slice.profile);
const selectNotifications = createSelector(
  [selectSlice],
  (slice) => slice.notifications
);
const selectPreferences = createSelector(
  [selectSlice],
  (slice) => slice.preferences
);
const selectLoading = createSelector([selectSlice], (slice) => slice.loading);
const selectError = createSelector([selectSlice], (slice) => slice.error);
const selectInitialized = createSelector(
  [selectSlice],
  (slice) => slice.initialized
);

export const settingsSelectors = {
  profile: selectProfile,
  notifications: selectNotifications,
  preferences: selectPreferences,
  loading: selectLoading,
  error: selectError,
  initialized: selectInitialized,
};
