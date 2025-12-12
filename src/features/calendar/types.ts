import type { Activity } from "@features/activities/types";

export type CalendarActivityEntry = {
  activity: Activity;
  dateValue: string;
  source: "planned" | "official";
};

export type DayGroup = {
  key: string;
  date: Date;
  entries: CalendarActivityEntry[];
  hasPlanned: boolean;
  hasOfficial: boolean;
};
