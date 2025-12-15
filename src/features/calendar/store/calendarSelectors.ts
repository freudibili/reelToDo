import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@core/store";

import { activitiesSelectors } from "@features/activities/store/activitiesSelectors";
import { buildDayGroups } from "@features/calendar/utils/calendarData";

const selectSlice = (state: RootState) => state.calendar;

const selectedDate = createSelector([selectSlice], (slice) => slice.selectedDate);
const visibleMonth = createSelector([selectSlice], (slice) => slice.visibleMonth);
const visibleMonthDate = createSelector(
  [visibleMonth],
  (iso) => new Date(iso)
);
const monthPrefix = createSelector([visibleMonth], (iso) => iso.slice(0, 7));
const dayGroups = createSelector(
  [activitiesSelectors.items],
  (activities) => buildDayGroups(activities)
);
const selectedDayGroup = createSelector(
  [dayGroups, selectedDate],
  (groups, selectedKey) =>
    groups.find((group) => group.key === selectedKey) ?? null
);
const selectedEntries = createSelector(
  [selectedDayGroup],
  (group) => group?.entries ?? []
);

export const calendarSelectors = {
  selectedDate,
  visibleMonth,
  visibleMonthDate,
  monthPrefix,
  dayGroups,
  selectedDayGroup,
  selectedEntries,
};
