import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import type { Activity } from "../utils/types";

interface Props {
  activity: Activity;
  onPress: (activity: Activity) => void;
}

const ActivityCard: React.FC<Props> = ({ activity, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={() => onPress(activity)}>
      {activity.image_url ? (
        <Image source={{ uri: activity.image_url }} style={styles.image} />
      ) : null}
      <View style={styles.cardContent}>
        <Text style={styles.title}>{activity.title ?? "Activity"}</Text>
        <Text style={styles.meta}>
          {activity.category ?? "—"} ·{" "}
          {activity.city ?? activity.location_name ?? "—"}
          {activity.country ?? ""}
        </Text>
        {activity.creator ? (
          <Text style={styles.creator}>by {activity.creator}</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: { width: "100%", height: 180, backgroundColor: "#eee" },
  cardContent: { padding: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { marginTop: 4, color: "#666" },
  creator: { marginTop: 4, color: "#333" },
});

export default ActivityCard;
