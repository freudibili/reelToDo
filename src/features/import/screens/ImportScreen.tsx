import React, { useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { ShareIntent } from "expo-share-intent";

import { selectAuthUser } from "@features/auth/store/authSelectors";
import {
  selectImportLoading,
  selectImportError,
  selectImportedActivity,
} from "@features/import/store/importSelectors";
import { analyzeSharedLink } from "@features/import/store/importSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";

const ImportScreen = () => {
  const { shared } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  const loading = useAppSelector(selectImportLoading);
  const error = useAppSelector(selectImportError);
  const activity = useAppSelector(selectImportedActivity);

  const sharedData = useMemo<ShareIntent | null>(() => {
    if (!shared || Array.isArray(shared)) return null;
    try {
      return JSON.parse(shared) as ShareIntent;
    } catch {
      return null;
    }
  }, [shared]);

  const analyze = useCallback(() => {
    if (!sharedData?.webUrl || !user?.id) return;
    dispatch(
      analyzeSharedLink({
        shared: sharedData,
        userId: user.id,
      })
    );
  }, [dispatch, sharedData, user]);

  useEffect(() => {
    if (sharedData?.webUrl && user?.id) {
      analyze();
    }
  }, [sharedData?.webUrl, user?.id, analyze]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import activity</Text>
      <TextInput
        style={styles.input}
        value={sharedData?.webUrl}
        placeholder="Paste link here"
        autoCapitalize="none"
        autoCorrect={false}
        editable={false}
      />
      <Button
        title={loading ? "Analyzing..." : "Analyze"}
        onPress={analyze}
        disabled={loading || !sharedData?.webUrl}
      />

      {loading && <ActivityIndicator style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {activity && (
        <ScrollView style={styles.result}>
          {activity.image_url && (
            <Image
              source={{ uri: activity.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <View style={styles.details}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{activity.title}</Text>

            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{activity.category}</Text>

            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{activity.location_name}</Text>

            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{activity.city}</Text>

            <Text style={styles.label}>Country</Text>
            <Text style={styles.value}>{activity.country}</Text>

            <Text style={styles.label}>Creator</Text>
            <Text style={styles.value}>{activity.creator}</Text>

            <Text style={styles.label}>Tags</Text>
            <Text style={styles.value}>
              {Array.isArray(activity.tags) ? activity.tags.join(", ") : ""}
            </Text>

            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>
              {typeof activity.confidence === "number"
                ? `${Math.round(activity.confidence * 100)}%`
                : "—"}
            </Text>

            <Text style={styles.label}>Source URL</Text>
            <Text style={styles.value}>{activity.source_url}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 40 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  loader: { marginTop: 12 },
  error: { color: "#c00", marginTop: 8 },
  result: { marginTop: 20 },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  details: { paddingBottom: 40 },
  label: { marginTop: 8, fontWeight: "600" },
  value: { marginTop: 2, color: "#333" },
});

export default ImportScreen;
