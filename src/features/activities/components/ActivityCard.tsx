import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { IconButton } from "react-native-paper";
import type { Activity } from "../utils/types";

interface Props {
  activity: Activity;
  onPress: (activity: Activity) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const ActivityCard: React.FC<Props> = ({
  activity,
  onPress,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <Pressable style={styles.card} onPress={() => onPress(activity)}>
      <View style={styles.imageWrapper}>
        {activity.image_url ? (
          <Image source={{ uri: activity.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          size={20}
          onPress={() => onToggleFavorite(activity.id)}
          style={styles.favoriteBtn}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{activity.title ?? "Activity"}</Text>
        <Text style={styles.meta}>
          {activity.category ?? "—"} ·{" "}
          {activity.city ?? activity.location_name ?? "—"}
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
  imageWrapper: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { width: "100%", height: "100%", backgroundColor: "#ddd" },
  favoriteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  cardContent: { padding: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { marginTop: 4, color: "#666" },
  creator: { marginTop: 4, color: "#333" },
});

export default ActivityCard;
