import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";
import type { Activity } from "../utils/types";

const selectSlice = (state: RootState) => state.activities;

const items = createSelector([selectSlice], (slice) => slice.items ?? []);
const loading = createSelector([selectSlice], (slice) => slice.loading);
const initialized = createSelector([selectSlice], (slice) => slice.initialized);
const favoriteIds = createSelector(
  [selectSlice],
  (slice) => slice.favoriteIds ?? []
);

const groupedByCategory = createSelector([items], (list) => {
  const groups: Record<string, Activity[]> = {};
  list.forEach((item) => {
    const key = item.category || "other";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  return Object.entries(groups).map(([category, activities]) => ({
    category,
    activities,
  }));
});

const byId = (id: string) =>
  createSelector([items], (list) => list.find((a) => a.id === id) ?? null);

const isFavorite = (activityId: string) =>
  createSelector([favoriteIds], (favorites) => favorites.includes(activityId));

export const activitiesSelectors = {
  items,
  loading,
  initialized,
  groupedByCategory,
  favoriteIds,
  isFavorite,
  byId,
};
