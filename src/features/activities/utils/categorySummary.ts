import i18next from "i18next";

import { haversineDistanceKm } from "./distance";
import { getRecentActivities } from "./recentActivities";
import type { Activity } from "./types";

export interface CategoryCardItem {
  id: string;
  name: string;
  activityCount: number;
  heroImageUrl?: string | null;
  hasCluster: boolean;
}

const CLUSTER_RADIUS_KM = 1;
const MIN_CLUSTER = 2;
const RECENT_CATEGORY_ID = "recent";
const FAVORITES_CATEGORY_ID = "favorites";

const parseDate = (value: string | null | undefined) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const sortByFreshness = (a: Activity, b: Activity) =>
  parseDate(b.created_at) - parseDate(a.created_at);

const sortByNewest = (list: Activity[]) => [...list].sort(sortByFreshness);

const hasCluster = (activities: Activity[]) => {
  const withCoords = activities.filter(
    (a) =>
      typeof a.latitude === "number" &&
      typeof a.longitude === "number" &&
      a.latitude != null &&
      a.longitude != null
  );
  if (withCoords.length < MIN_CLUSTER) return false;

  for (let i = 0; i < withCoords.length; i += 1) {
    for (let j = i + 1; j < withCoords.length; j += 1) {
      const a = withCoords[i];
      const b = withCoords[j];
      const distanceKm = haversineDistanceKm(
        a.latitude as number,
        a.longitude as number,
        b.latitude as number,
        b.longitude as number
      );
      if (distanceKm <= CLUSTER_RADIUS_KM) {
        return true;
      }
    }
  }
  return false;
};

const pickHeroImage = (
  activities: Activity[],
  options?: { respectInputOrder?: boolean }
) => {
  const respectInputOrder = options?.respectInputOrder ?? false;

  // When we already sorted the array by a meaningful signal (e.g. favorited_at),
  // just take the first image in that order.
  if (respectInputOrder) {
    const firstWithImage = activities.find((a) => a.image_url);
    if (firstWithImage?.image_url) return firstWithImage.image_url;
  }

  // Default: use the most recently created activity with an image.
  const newestWithImage = sortByNewest(activities).find((a) => a.image_url);
  if (newestWithImage?.image_url) {
    return newestWithImage.image_url;
  }

  // Fallback to any image available
  const withImages = activities.filter((a) => a.image_url);
  if (withImages.length === 0) return null;

  return withImages[0].image_url ?? null;
};

const buildRecentCard = (
  activities: Activity[],
  recentLimit: number
): CategoryCardItem | null => {
  if (activities.length === 0) return null;
  const recentActivities = getRecentActivities(activities, recentLimit);
  return {
    id: RECENT_CATEGORY_ID,
    name: RECENT_CATEGORY_ID,
    activityCount: recentActivities.length,
    heroImageUrl: pickHeroImage(recentActivities),
    hasCluster: hasCluster(recentActivities),
  };
};

const buildFavoritesCard = (
  favoriteActivities: Activity[]
): CategoryCardItem | null => {
  if (!favoriteActivities || favoriteActivities.length === 0) return null;
  return {
    id: FAVORITES_CATEGORY_ID,
    name: FAVORITES_CATEGORY_ID,
    activityCount: favoriteActivities.length,
    heroImageUrl: pickHeroImage(favoriteActivities, {
      respectInputOrder: true,
    }),
    hasCluster: hasCluster(favoriteActivities),
  };
};

export const buildCategoryCards = (
  activities: Activity[],
  options?: {
    includeRecent?: boolean;
    recentLimit?: number;
    includeFavorites?: boolean;
    favoriteActivities?: Activity[];
  }
): CategoryCardItem[] => {
  const includeRecent = options?.includeRecent ?? true;
  const recentLimit = options?.recentLimit ?? 10;
  const includeFavorites = options?.includeFavorites ?? true;
  const favoriteActivities = options?.favoriteActivities ?? [];
  const groups: Record<string, Activity[]> = {};

  activities.forEach((activity) => {
    const key = (activity.category || "other").toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
  });

  const cards = Object.entries(groups)
    .map(([category, list]) => {
      return {
        id: category,
        name: category,
        activityCount: list.length,
        heroImageUrl: pickHeroImage(list),
        hasCluster: hasCluster(list),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const recentCard = includeRecent
    ? buildRecentCard(activities, recentLimit)
    : null;
  const favoritesCard = includeFavorites
    ? buildFavoritesCard(favoriteActivities)
    : null;

  const specials = [favoritesCard, recentCard].filter(
    (card): card is CategoryCardItem => Boolean(card)
  );

  return [...specials, ...cards];
};

export const formatCategoryName = (raw: string) => {
  if (!raw) return i18next.t("activities:category.other", "Other");
  const base = raw.replace(/[-_]/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export const categorySummary = {
  buildCategoryCards,
  formatCategoryName,
};

export const categoryConstants = {
  RECENT_CATEGORY_ID,
  FAVORITES_CATEGORY_ID,
};
