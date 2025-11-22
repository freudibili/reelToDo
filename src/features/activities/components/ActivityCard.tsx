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
        <View style={styles.titleOverlay}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {activity.title ?? "Activity"}
          </Text>
        </View>
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          size={20}
          onPress={() => onToggleFavorite(activity.id)}
          style={styles.favoriteBtn}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0f0f0f",
  },
  imageWrapper: {
    width: "100%",
    height: 150,
    backgroundColor: "#111",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { width: "100%", height: "100%", backgroundColor: "#333" },
  titleOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  favoriteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});

export default ActivityCard;
