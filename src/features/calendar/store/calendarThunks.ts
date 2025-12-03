import { createAsyncThunk } from "@reduxjs/toolkit";
import i18next from "@common/i18n/i18n";
import { createCalendarEventForActivity } from "../services/calendarService";
import { getOfficialDateValue } from "@features/activities/utils/activityDisplay";
import type { RootState } from "@core/store";

export const createActivityCalendarEvent = createAsyncThunk<
  { activityId: string; calendarEventId: string; plannedAt: string | null },
  {
    activityId: string;
    activityDate?: { id?: string; start: string | Date; end?: string | Date };
  },
  { state: RootState; rejectValue: string }
>(
  "activities/createActivityCalendarEvent",
  async ({ activityId, activityDate }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue(i18next.t("activities:errors.noUser"));
    }

    const activity = getState().activities.items.find(
      (a) => a.id === activityId
    );
    if (!activity) {
      return rejectWithValue(i18next.t("activities:errors.notFound"));
    }

    const eventId = await createCalendarEventForActivity(
      userId,
      activity,
      activityDate
    );
    if (!eventId) {
      return rejectWithValue(
        i18next.t("activities:errors.calendarCreateFailed")
      );
    }

    const officialDateValue = getOfficialDateValue(activity);
    const plannedAt = activityDate?.start
      ? new Date(activityDate.start).toISOString()
      : officialDateValue
        ? new Date(officialDateValue).toISOString()
        : null;

    return { activityId, calendarEventId: eventId, plannedAt };
  }
);
