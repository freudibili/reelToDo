import * as Location from "expo-location";
import type { Region } from "react-native-maps";

const geocodeToRegion = async (
  fallbackAddress?: string | null
): Promise<Region | null> => {
  const trimmed = fallbackAddress?.trim();
  if (!trimmed) return null;

  try {
    const results = await Location.geocodeAsync(trimmed);
    const first = results.find(
      (result) =>
        typeof result.latitude === "number" &&
        typeof result.longitude === "number"
    );

    if (!first) return null;

    return {
      latitude: first.latitude,
      longitude: first.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  } catch {
    return null;
  }
};

export const requestUserRegion = async (
  fallbackAddress?: string | null
): Promise<Region | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
  } catch {
    // Ignore and try fallback geocoding instead
  }

  return geocodeToRegion(fallbackAddress);
};
