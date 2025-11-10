import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import type { Activity } from "../utils/types";

const getDefaultCalendarSource = async () => {
  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar?.source ?? null;
  }
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const localCalendar = calendars.find((c) => c.source?.isLocalAccount);
  return localCalendar?.source ?? null;
};

export const ensureCalendarPermission = async () => {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status === "granted") return true;
  const { status: nextStatus } =
    await Calendar.requestCalendarPermissionsAsync();
  return nextStatus === "granted";
};

export const getOrCreateCalendarId = async () => {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const existing = calendars.find((c) => c.allowsModifications);
  if (existing) return existing.id;

  const source = await getDefaultCalendarSource();

  const newCalendarId = await Calendar.createCalendarAsync({
    title: "ReelToDo",
    color: "#FF7A00",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source?.id,
    source,
    name: "ReelToDo",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return newCalendarId;
};

export const createEventFromActivity = async (activity: Activity) => {
  const hasPerm = await ensureCalendarPermission();
  if (!hasPerm) return null;

  const calendarId = await getOrCreateCalendarId();

  const startDate = activity.main_date
    ? new Date(activity.main_date)
    : new Date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: activity.title,
    startDate,
    endDate,
    location: activity.location_name ?? activity.address ?? "",
    notes: activity.source_url ?? "",
    url: activity.source_url ?? undefined,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return eventId;
};
