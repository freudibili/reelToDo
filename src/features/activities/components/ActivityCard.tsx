import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Icon } from "react-native-paper";
import {
  formatActivityLocation,
  formatDisplayDate,
  getPrimaryDateValue,
} from "../utils/activityDisplay";
import type { Activity } from "../utils/types";
import { useTranslation } from "react-i18next";

interface Props {
  activity: Activity;
  onPress: (activity: Activity) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (activity: Activity) => void;
}

const ActivityCard: React.FC<Props> = ({
  activity,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const locationLabel = formatActivityLocation(activity);
  const primaryDate = getPrimaryDateValue(activity);
  const dateLabel = formatDisplayDate(primaryDate);
  const isPlanned = Boolean(activity.planned_at);

  return (
    <Pressable style={styles.card} onPress={() => onPress(activity)}>
      <View style={styles.imageWrapper}>
        {activity.image_url ? (
          <Image
            source={{ uri: activity.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {onToggleFavorite ? (
          <Pressable
            hitSlop={10}
            onPress={() => onToggleFavorite(activity)}
            style={styles.favoriteBtn}
          >
            <Icon
              source={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#ef4444" : "#fff"}
            />
          </Pressable>
        ) : null}
        <View style={styles.titleOverlay}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {activity.title ?? t("activities:card.untitled")}
          </Text>
          {locationLabel ? (
            <View style={styles.metaRow}>
              <Icon source="map-marker" size={14} color="#d1d5db" />
              <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                {locationLabel}
              </Text>
            </View>
          ) : null}
          {dateLabel ? (
            <View style={styles.metaRow}>
              <Icon
                source={isPlanned ? "calendar-check" : "calendar"}
                size={14}
                color="#d1d5db"
              />
              <Text
                style={styles.metaText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isPlanned
                  ? t("activities:planned.timeLabel", { value: dateLabel })
                  : dateLabel}
              </Text>
            </View>
          ) : null}
        </View>
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
    backgroundColor: "rgba(0,0,0,0.38)",
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#e5e7eb",
    fontSize: 13,
    flexShrink: 1,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});

export default ActivityCard;
