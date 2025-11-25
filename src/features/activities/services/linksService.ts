import { Linking } from "react-native";
import type { Activity } from "../utils/types";

export const openActivityInMaps = (activity: Activity): void => {
  if (activity.latitude && activity.longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
    Linking.openURL(url);
    return;
  }

  const query =
    activity.address ||
    activity.location_name ||
    activity.city ||
    activity.title;
  if (query) {
    const encoded = encodeURIComponent(query);
    const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    Linking.openURL(url);
  }
};

export const openActivitySource = (activity: Activity): void => {
  if (activity.source_url) {
    Linking.openURL(activity.source_url);
  }
};
