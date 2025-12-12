import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Box, Text } from "@common/designSystem";
import { radii, spacing } from "@common/designSystem/tokens";
import { useAppTheme } from "@common/theme/appTheme";
import AppImage from "@common/components/AppImage";
import FavoriteHeart from "./FavoriteHeart";
import {
  formatActivityLocation,
  formatDisplayDate,
  getPrimaryDateValue,
} from "../utils/activityDisplay";
import type { Activity, ActivityProcessingStatus } from "../types";

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
  const processingStatus = (activity.processing_status ??
    "complete") as ActivityProcessingStatus;
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";
  const processingBackground = colors.primarySurface ?? colors.card;
  const processingText = colors.primaryText;
  const failureText = colors.favoriteContrast;

  return (
    <Pressable style={styles.card} onPress={() => onPress(activity)}>
      <Box
        rounded="lg"
        style={[styles.imageWrapper, { backgroundColor: colors.mutedSurface }]}
      >
        <AppImage
          uri={activity.image_url}
          style={styles.image}
          resizeMode="cover"
        >
          {isProcessing ? (
            <Box
              rounded="pill"
              paddingHorizontal={spacing.sm}
              paddingVertical={spacing.xs}
              style={[
                styles.statusPill,
                { backgroundColor: processingBackground },
              ]}
            >
              <ActivityIndicator color={colors.primary} size="small" />
              <Text
                variant="caption"
                weight="700"
                style={{ color: processingText }}
              >
                {t("activities:card.processing")}
              </Text>
            </Box>
          ) : null}
          {isFailed ? (
            <Box
              rounded="pill"
              paddingHorizontal={spacing.sm}
              paddingVertical={spacing.xs}
              style={[styles.statusPill, { backgroundColor: colors.danger }]}
            >
              <Icon source="alert" size={14} color={failureText} />
              <Text
                variant="caption"
                weight="700"
                style={{ color: failureText }}
              >
                {t("activities:card.failed")}
              </Text>
            </Box>
          ) : null}
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
      </Box>

      <Box style={styles.content} gap={spacing.xs}>
        <Text variant="headline" numberOfLines={2} ellipsizeMode="tail">
          {activity.title ?? t("activities:card.untitled")}
        </Text>

        {locationLabel ? (
          <Box direction="row" align="center" gap={6}>
            <Icon source="map-marker" size={14} color={colors.secondaryText} />
            <Text
              variant="bodySmall"
              tone="muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationLabel}
            </Text>
          </Box>
        ) : null}

        {dateLabel ? (
          <Box direction="row" align="center" gap={6}>
            <Icon
              source={isPlanned ? "calendar-check" : "calendar"}
              size={14}
              color={colors.secondaryText}
            />
            <Text
              variant="bodySmall"
              tone="muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isPlanned
                ? t("activities:planned.timeLabel", { value: dateLabel })
                : dateLabel}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Pressable>
  );
};

export default ActivityCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
  },
  imageWrapper: {
    width: "100%",
    height: 150,
    borderRadius: radii.lg,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: spacing.sm / 2,
    paddingVertical: spacing.sm,
  },
  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  statusPill: {
    position: "absolute",
    top: 12,
    left: 12,
  },
});
