import type { Activity } from "@features/activities/utils/types";
import {
  getOfficialDateValue,
  parseDateValue,
} from "@features/activities/utils/activityDisplay";
import { toDayKey, type CalendarDay } from "./dates";
import type { CalendarActivityEntry, DayGroup } from "../types";

export const buildDayGroups = (activities: Activity[]): DayGroup[] => {
  const groups: Record<string, DayGroup> = {};

  const addEntry = (
    activity: Activity,
    source: CalendarActivityEntry["source"],
    dateValue: string
  ) => {
    const parsed = parseDateValue(dateValue);
    if (!parsed) return;
    const key = toDayKey(parsed);
    if (!groups[key]) {
      groups[key] = {
        key,
        date: parsed,
        entries: [],
        hasPlanned: false,
        hasOfficial: false,
      };
    }

    groups[key].entries.push({ activity, source, dateValue });
    if (source === "planned") {
      groups[key].hasPlanned = true;
    } else {
      groups[key].hasOfficial = true;
    }
  };

  activities.forEach((activity) => {
    const plannedValue = activity.planned_at ?? null;
    const officialValue = getOfficialDateValue(activity);
    const plannedDate = parseDateValue(plannedValue);
    const officialDate = parseDateValue(officialValue);
    const plannedKey = plannedDate ? toDayKey(plannedDate) : null;
    const officialKey = officialDate ? toDayKey(officialDate) : null;

    if (plannedValue && plannedDate) {
      addEntry(activity, "planned", plannedValue);
    }

    if (
      officialValue &&
      officialDate &&
      officialKey !== plannedKey
    ) {
      addEntry(activity, "official", officialValue);
    } else if (
      officialValue &&
      officialDate &&
      officialKey &&
      officialKey === plannedKey &&
      groups[officialKey]
    ) {
      groups[officialKey].hasOfficial = true;
    }
  });

  return Object.values(groups)
    .map((group) => ({
      ...group,
      entries: group.entries.sort((a, b) => {
        const aDate = parseDateValue(a.dateValue)?.getTime() ?? 0;
        const bDate = parseDateValue(b.dateValue)?.getTime() ?? 0;
        return aDate - bDate;
      }),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const buildMonthDays = (
  visibleMonthDate: Date,
  dayGroups: DayGroup[]
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const plannedKeys = new Set(
    dayGroups.filter((g) => g.hasPlanned).map((g) => g.key)
  );
  const officialKeys = new Set(
    dayGroups.filter((g) => g.hasOfficial).map((g) => g.key)
  );
  const month = visibleMonthDate.getMonth();
  const year = visibleMonthDate.getFullYear();
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= totalDays; i += 1) {
    const date = new Date(year, month, i);
    const key = toDayKey(date);
    const hasPlanned = plannedKeys.has(key);
    const hasOfficial = officialKeys.has(key);
    days.push({
      key,
      date,
      hasActivity: hasPlanned || hasOfficial,
      hasPlanned,
      hasOfficial,
    });
  }
  return days;
};
