import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@core/store";

import type { Activity } from "../types";
import {
  buildCategoryCards,
  type CategoryCardItem,
} from "../utils/categorySummary";
import { categoryConstants } from "../utils/constants";
import {
  getFavoriteActivitiesSorted,
  getRecentActivities,
} from "../utils/recentActivities";

const selectSlice = (state: RootState) => state.activities;

const items = createSelector([selectSlice], (slice) => slice.items ?? []);
const loading = createSelector([selectSlice], (slice) => slice.loading);
const initialized = createSelector([selectSlice], (slice) => slice.initialized);
const favoriteIds = createSelector(
  [selectSlice],
  (slice) => slice.favoriteIds ?? []
);
const recentlyEmptiedCategory = createSelector(
  [selectSlice],
  (slice) => slice.recentlyEmptiedCategory
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

const recentActivities = createSelector([items], (list) =>
  getRecentActivities(list, 10)
);

const favoriteActivities = createSelector([items, favoriteIds], (list, favs) =>
  getFavoriteActivitiesSorted(list, favs)
);

const categoryCards = createSelector(
  [items, favoriteActivities],
  (list, favorites) =>
    buildCategoryCards(list, {
      includeRecent: true,
      recentLimit: 10,
      includeFavorites: true,
      favoriteActivities: favorites,
    })
);

const byId = (id: string) =>
  createSelector([items], (list) => list.find((a) => a.id === id) ?? null);

const byCategory = (category: string) =>
  createSelector([items, favoriteIds], (list, favorites) =>
    category.toLowerCase() === categoryConstants.RECENT_CATEGORY_ID
      ? getRecentActivities(list, 10)
      : category.toLowerCase() === categoryConstants.FAVORITES_CATEGORY_ID
        ? getFavoriteActivitiesSorted(list, favorites)
        : list.filter(
            (a) =>
              (a.category || "other").toLowerCase() ===
                category.toLowerCase() ||
              (category === "other" && !a.category)
          )
  );

const isFavorite = (activityId: string) =>
  createSelector([favoriteIds], (favorites) => favorites.includes(activityId));

export const activitiesSelectors = {
  items,
  loading,
  initialized,
  recentlyEmptiedCategory,
  groupedByCategory,
  categoryCards,
  recentActivities,
  favoriteActivities,
  favoriteIds,
  isFavorite,
  byId,
  byCategory,
};

export type { CategoryCardItem };
