import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";

import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivityDetailsModal from "../components/ActivityDetailsModal";
import type { Activity } from "../utils/types";
import { useAppSelector } from "@core/store/hook";

const ActivitiesMapScreen = () => {
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);
  const activities = useAppSelector(activitiesSelectors.items);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission refusée",
            "Impossible d'accéder à votre position."
          );
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      } catch (err) {
        console.error("Erreur localisation:", err);
      }
    };

    requestLocation();
  }, []);

  const initialRegion = useMemo<Region>(() => {
    if (userRegion) return userRegion;
    const withCoords = activities.find(
      (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
    );
    if (withCoords) {
      return {
        latitude: withCoords.latitude as number,
        longitude: withCoords.longitude as number,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
    }
    return {
      latitude: 47.3769,
      longitude: 8.5417,
      latitudeDelta: 0.35,
      longitudeDelta: 0.35,
    };
  }, [userRegion, activities]);

  const handleMarkerPress = (activity: Activity) => {
    setSelected(activity);
    setModalVisible(true);
  };

  if (!initialized || loading || !initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {activities
          .filter(
            (a) =>
              typeof a.latitude === "number" && typeof a.longitude === "number"
          )
          .map((activity) => (
            <Marker
              key={activity.id}
              coordinate={{
                latitude: activity.latitude as number,
                longitude: activity.longitude as number,
              }}
              title={activity.title}
              description={activity.location_name ?? activity.category ?? ""}
              onPress={() => handleMarkerPress(activity)}
            />
          ))}
      </MapView>

      <ActivityDetailsModal
        visible={modalVisible}
        activity={selected}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default ActivitiesMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
