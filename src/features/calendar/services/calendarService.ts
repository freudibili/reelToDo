import * as Calendar from "expo-calendar";
import { supabase } from "@config/supabase";
import type { Activity } from "@features/activities/utils/types";
import { getOfficialDateValue } from "@features/activities/utils/activityDisplay";

type ActivityDateInput = {
  start: string | Date;
  end?: string | Date;
  id?: string;
};

const ensureCalendarPermission = async () => {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") return true;
  const { status: next } = await Calendar.requestCalendarPermissionsAsync();
  return next === "granted";
};

const getDefaultSource = async () => {
  try {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar?.source) {
      return defaultCalendar.source;
    }
  } catch (e) {
    console.warn("calendar: unable to load default calendar source", e);
  }
  return null;
};

const findPreferredCalendarId = (calendars: Calendar.Calendar[]) => {
  const writable = calendars.filter((c) => c.allowsModifications);
  const googleCalendar = writable.find((c) => {
    const sourceName = c.source?.name?.toLowerCase?.() ?? "";
    const owner =
      typeof (c as any).ownerAccount === "string"
        ? ((c as any).ownerAccount as string).toLowerCase()
        : "";
    return (
      sourceName.includes("google") ||
      sourceName.includes("gmail") ||
      owner.includes("gmail.com") ||
      owner.includes("google")
    );
  });

  if (googleCalendar) return googleCalendar.id;
  return writable[0]?.id ?? null;
};

const getOrCreateCalendarId = async () => {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  if (!calendars.length) {
    console.warn("calendar: no calendars returned, creating local fallback");
  }

  const preferred = findPreferredCalendarId(calendars);
  if (preferred) return preferred;

  const defaultSource =
    calendars.find((c) => c.source && c.source.isLocalAccount)?.source ||
    calendars[0]?.source ||
    (await getDefaultSource()) ||
    undefined;

  const calendarId = await Calendar.createCalendarAsync({
    title: "ReelToDo",
    source: defaultSource,
    sourceId: defaultSource?.id,
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
  activityDate?: ActivityDateInput
) => {
  const ok = await ensureCalendarPermission();
  if (!ok) return null;

  const calendarId = await getOrCreateCalendarId();

  const officialDateValue = getOfficialDateValue(activity);
  const baseStart = activityDate?.start ?? officialDateValue;
  if (!baseStart) {
    console.warn("calendar: skipping create, missing activity date");
    return null;
  }

  const startDate = new Date(baseStart);
  if (Number.isNaN(startDate.getTime())) {
    console.warn("calendar: invalid start date", baseStart);
    return null;
  }

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
    activityDate?.start ?? officialDateValue ?? startDate.toISOString();

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

export const updateCalendarEventForActivity = async (
  eventId: string,
  activity: Activity,
  plannedAt: string | Date | null,
  activityDate?: ActivityDateInput
) => {
  const ok = await ensureCalendarPermission();
  if (!ok) return null;

  const officialDateValue = getOfficialDateValue(activity);
  const startDate = plannedAt
    ? new Date(plannedAt)
    : activityDate
      ? new Date(activityDate.start)
      : officialDateValue
        ? new Date(officialDateValue)
        : new Date();

  const existing = await Calendar.getEventAsync(eventId).catch(() => null);
  const baseDuration =
    existing?.startDate && existing?.endDate
      ? new Date(existing.endDate).getTime() -
        new Date(existing.startDate).getTime()
      : 60 * 60 * 1000;

  const endDate = activityDate?.end
    ? new Date(activityDate.end)
    : new Date(startDate.getTime() + baseDuration);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  await Calendar.updateEventAsync(eventId, {
    title: activity.title,
    startDate,
    endDate,
    location: activity.location_name ?? activity.address ?? activity.city ?? "",
    notes: activity.source_url ?? "",
    url: activity.source_url ?? undefined,
    timeZone,
  });

  return eventId;
};

export const deleteCalendarEvent = async (eventId: string) => {
  const ok = await ensureCalendarPermission();
  if (!ok) return false;
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch {
    return false;
  }
};
