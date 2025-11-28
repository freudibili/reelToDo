import type { Activity } from "./types";

export const shouldForceLocationEdit = (activity: Activity) =>
  activity.needs_location_confirmation ||
  !activity.address ||
  !activity.location_name;

export const getLocationActionIcon = (activity: Activity) =>
  shouldForceLocationEdit(activity) ? "pencil" : "help-circle-outline";
