import { ActivityCategory } from "./types";

export const categoriesRequiringDate: Set<ActivityCategory> = new Set([
  "event-market",
  "event-festival",
  "event-concert",
  "event-exhibition",
  "workshop-cooking",
  "workshop-art",
  "workshop-wellness",
]);

export const categoryNeedsDate = (cat?: string | null): boolean =>
  !!cat && categoriesRequiringDate.has(cat as ActivityCategory);
