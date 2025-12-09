import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Icon } from "react-native-paper";
import {
  formatActivityLocation,
  formatDisplayDate,
  getPrimaryDateValue,
} from "../utils/activityDisplay";
import type { Activity } from "../utils/types";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import FavoriteHeart from "./FavoriteHeart";
import AppImage from "@common/components/AppImage";

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
  const { colors } = useAppTheme();

  const locationLabel = formatActivityLocation(activity);
  const primaryDate = getPrimaryDateValue(activity);
  const dateLabel = formatDisplayDate(primaryDate);
  const isPlanned = Boolean(activity.planned_at);

  return (
    <Pressable style={styles.card} onPress={() => onPress(activity)}>
      <View
        style={[styles.imageWrapper, { backgroundColor: colors.mutedSurface }]}
      >
        <AppImage
          uri={activity.image_url}
          style={styles.image}
          resizeMode="cover"
        >
          {onToggleFavorite && (
            <Pressable
              hitSlop={10}
              onPress={() => onToggleFavorite(activity)}
              style={styles.favoriteBtn}
            >
              <FavoriteHeart selected={isFavorite} size={20} />
            </Pressable>
          )}
        </AppImage>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {activity.title ?? t("activities:card.untitled")}
        </Text>

        {locationLabel ? (
          <View style={styles.metaRow}>
            <Icon source="map-marker" size={14} color={colors.secondaryText} />
            <Text
              style={[styles.metaText, { color: colors.secondaryText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationLabel}
            </Text>
          </View>
        ) : null}

        {dateLabel ? (
          <View style={styles.metaRow}>
            <Icon
              source={isPlanned ? "calendar-check" : "calendar"}
              size={14}
              color={colors.secondaryText}
            />
            <Text
              style={[styles.metaText, { color: colors.secondaryText }]}
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
    </Pressable>
  );
};

export default ActivityCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  imageWrapper: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    flexShrink: 1,
  },
  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});
