import * as Calendar from "expo-calendar";
import { supabase } from "@config/supabase";
import type { Activity } from "@features/activities/utils/types";

const ensureCalendarPermission = async () => {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") return true;
  const { status: next } = await Calendar.requestCalendarPermissionsAsync();
  return next === "granted";
};

const getOrCreateCalendarId = async () => {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  const editable = calendars.find((c) => c.allowsModifications);
  if (editable) return editable.id;

  const source =
    calendars.find((c) => c.source && c.source.isLocalAccount)?.source ||
    calendars[0]?.source ||
    undefined;

  const calendarId = await Calendar.createCalendarAsync({
    title: "ReelToDo",
    source,
    sourceId: source?.id,
    entityType: Calendar.EntityTypes.EVENT,
    name: "ReelToDo",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return calendarId;
};

export const createCalendarEventForActivity = async (
  userId: string,
  activity: Activity,
  activityDate?: { start: string | Date; end?: string | Date; id?: string }
) => {
  const ok = await ensureCalendarPermission();
  if (!ok) return null;

  const calendarId = await getOrCreateCalendarId();

  const startDate = activityDate
    ? new Date(activityDate.start)
    : activity.main_date
      ? new Date(activity.main_date)
      : new Date();

  const endDate = activityDate?.end
    ? new Date(activityDate.end)
    : new Date(startDate.getTime() + 60 * 60 * 1000);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: activity.title,
    startDate,
    endDate,
    location: activity.location_name ?? activity.address ?? activity.city ?? "",
    notes: activity.source_url ?? "",
    url: activity.source_url ?? undefined,
    timeZone,
  });

  if (!eventId) return null;

  const plannedAtIso =
    activityDate?.start ?? activity.main_date ?? startDate.toISOString();

  await supabase.from("user_activities").upsert(
    {
      user_id: userId,
      activity_id: activity.id,
      activity_date_id: activityDate?.id ?? null,
      is_favorite: true,
      calendar_event_id: eventId,
      planned_at: plannedAtIso
        ? new Date(plannedAtIso).toISOString()
        : null,
    },
    {
      onConflict: "user_id,activity_id,activity_date_id",
    }
  );

  return eventId;
};
