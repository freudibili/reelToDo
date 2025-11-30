import type { Activity } from "./types";

const parseDate = (value: string | null | undefined) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const sortByFreshness = (a: Activity, b: Activity) =>
  parseDate(b.created_at) - parseDate(a.created_at);

const sortByFavoriteFreshness = (a: Activity, b: Activity) => {
  const favA = parseDate(a.favorited_at);
  const favB = parseDate(b.favorited_at);

  if (favA !== favB) return favB - favA;
  return sortByFreshness(a, b);
};

export const getRecentActivities = (
  activities: Activity[],
  limit = 10
): Activity[] => {
  if (!activities || activities.length === 0) return [];
  return [...activities].sort(sortByFreshness).slice(0, limit);
};

export const getFavoriteActivitiesSorted = (
  activities: Activity[],
  favoriteIds: string[]
): Activity[] => {
  if (!activities || activities.length === 0 || favoriteIds.length === 0)
    return [];

  const favoriteSet = new Set(favoriteIds);
  return activities
    .filter((a) => favoriteSet.has(a.id))
    .sort(sortByFavoriteFreshness);
};
