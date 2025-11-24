import * as Location from "expo-location";
import type { Region } from "react-native-maps";

export const requestUserRegion = async (): Promise<Region | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
};
