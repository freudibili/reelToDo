import type { Activity } from "./types";

const needsStatusOverride = (activity: Activity) => {
  const status = activity.location_status;
  return status === "missing" || status === "unconfirmed";
};

export const shouldForceLocationEdit = (activity: Activity) =>
  needsStatusOverride(activity) ||
  activity.needs_location_confirmation ||
  !activity.address ||
  !activity.location_name;

export const getLocationActionIcon = (activity: Activity) =>
  shouldForceLocationEdit(activity) ? "pencil" : "help-circle-outline";
