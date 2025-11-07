import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { supabase } from "@config/supabase";
import type { ShareIntent } from "expo-share-intent";

interface ShareIntentData extends ShareIntent {
  sourceUrl: string | null;
}

const ImportScreen = () => {
  const { shared } = useLocalSearchParams();

  const sharedData: ShareIntentData | null = useMemo(() => {
    if (!shared || Array.isArray(shared)) return null;
    try {
      return JSON.parse(shared);
    } catch {
      return null;
    }
  }, [shared]);

  const [url, setUrl] = useState(sharedData?.sourceUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) setUserId(data.user.id);
    };
    loadUser();
  }, []);

  const analyze = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setActivity(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-post", {
        body: { url, userId },
      });
      if (error) throw error;
      setActivity(data);
    } catch (e: any) {
      setError(e?.message ?? "Unable to analyze link");
    } finally {
      setLoading(false);
    }
  }, [url, userId]);

  useEffect(() => {
    if (sharedData?.sourceUrl) setUrl(sharedData.sourceUrl);
  }, [sharedData]);

  useEffect(() => {
    if (sharedData?.sourceUrl && userId !== undefined) analyze();
  }, [sharedData?.sourceUrl, userId, analyze]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import activity</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Paste link here"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title={loading ? "Analyzing..." : "Analyze"}
        onPress={analyze}
        disabled={loading || !url}
      />

      {loading && <ActivityIndicator style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {activity && (
        <ScrollView style={styles.result}>
          {activity.image_url ? (
            <Image
              source={{ uri: activity.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.details}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{activity.title}</Text>

            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{activity.category}</Text>

            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{activity.location_name}</Text>

            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{activity.city}</Text>

            <Text style={styles.label}>Creator</Text>
            <Text style={styles.value}>{activity.creator}</Text>

            <Text style={styles.label}>Tags</Text>
            <Text style={styles.value}>
              {Array.isArray(activity.tags) ? activity.tags.join(", ") : ""}
            </Text>

            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>
              {Math.round(activity.confidence * 100)}%
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
