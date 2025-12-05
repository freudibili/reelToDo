import { ActivityCategory } from "./types";

export const categoriesRequiringDate: Set<ActivityCategory> = new Set([
  "events_entertainment",
  "nightlife_social",
  "shopping_markets",
]);

export const categoryNeedsDate = (cat?: string | null): boolean =>
  !!cat && categoriesRequiringDate.has(cat as ActivityCategory);
