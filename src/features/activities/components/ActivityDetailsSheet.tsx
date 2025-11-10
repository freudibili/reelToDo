import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
} from "react-native";
import type { Activity } from "../utils/types";

interface Props {
  activity: Activity | null;
  isFavorite: boolean;
  onClose: () => void;
  onDelete: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  onOpenMaps: (activity: Activity) => void;
  onOpenSource: (activity: Activity) => void;
}

const ActivityDetailsSheet: React.FC<Props> = ({
  activity,
  isFavorite,
  onClose,
  onDelete,
  onToggleFavorite,
  onOpenMaps,
  onOpenSource,
}) => {
  if (!activity) return null;

  const metaLocation =
    activity.city ||
    activity.location_name ||
    activity.address ||
    activity.country ||
    "—";

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{activity.title ?? "Activité"}</Text>
        <Text style={styles.meta}>
          {activity.category ?? "—"} · {metaLocation}
        </Text>
      </View>
      {activity.image_url ? (
        <ImageBackground
          source={{ uri: activity.image_url }}
          style={styles.headerImage}
        >
          <View style={styles.imageOverlay} />
          <Pressable
            style={styles.circleBtn}
            onPress={() => onToggleFavorite(activity)}
          >
            <Text style={styles.circleBtnText}>{isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        </ImageBackground>
      ) : (
        <View style={styles.headerPlaceholder}>
          <Text style={styles.headerPlaceholderText}>
            {activity.title?.slice(0, 1).toUpperCase() ?? "A"}
          </Text>
          <Pressable
            style={styles.circleBtn}
            onPress={() => onToggleFavorite(activity)}
          >
            <Text style={styles.circleBtnText}>{isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.label}>Lieu</Text>
        <Text style={styles.value}>{activity.location_name ?? "—"}</Text>
        {activity.address ? (
          <Text style={styles.value}>{activity.address}</Text>
        ) : null}
        {activity.city ? (
          <Text style={styles.value}>{activity.city}</Text>
        ) : null}
        {activity.country ? (
          <Text style={styles.value}>{activity.country}</Text>
        ) : null}
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Tags</Text>
        <Text style={styles.value}>
          {Array.isArray(activity.tags) && activity.tags.length
            ? activity.tags.join(", ")
            : "—"}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Confiance</Text>
        <Text style={styles.value}>
          {activity.confidence
            ? `${Math.round(activity.confidence * 100)}%`
            : "—"}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.footerBtn}
          onPress={() => onOpenMaps(activity)}
        >
          <Text style={styles.footerBtnText}>Ouvrir Maps</Text>
        </Pressable>
        <Pressable
          style={[styles.footerBtn, !activity.source_url && styles.disabled]}
          onPress={() => onOpenSource(activity)}
          disabled={!activity.source_url}
        >
          <Text style={styles.footerBtnText}>Voir la source</Text>
        </Pressable>
        <Pressable style={styles.deleteBtn} onPress={() => onDelete(activity)}>
          <Text style={styles.deleteText}>🗑</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default ActivityDetailsSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 12,
  },
  headerBlock: {
    width: "60%",
  },
  headerImage: {
    height: 160,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  circleBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    height: 32,
    width: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  circleBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  headerPlaceholder: {
    height: 150,
    backgroundColor: "#0f172a",
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  headerPlaceholderText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  meta: {
    marginTop: 3,
    color: "#64748b",
  },
  creator: {
    marginTop: 3,
    color: "#0f172a",
  },
  block: {
    marginTop: 14,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#0f172a",
  },
  value: {
    color: "#1f2937",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
  },
  footerBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  deleteBtn: {
    width: 44,
    borderRadius: 999,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});
