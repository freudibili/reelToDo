import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import AppImage from "@common/components/AppImage";
import { Box, Text } from "@common/designSystem";
import { radii, spacing } from "@common/designSystem/tokens";
import { useAppTheme } from "@common/theme/appTheme";

import { formatCategoryName } from "../utils/categorySummary";
import type { CategoryCardItem } from "../utils/categorySummary";

interface Props extends CategoryCardItem {
  onPress: (category: string) => void;
}

const CategoryCard: React.FC<Props> = ({
  id,
  name,
  activityCount,
  heroImageUrl,
  hasCluster,
  onPress,
}) => {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 12,
    }).start();
  };

  const handlePress = () => {
    onPress(id);
  };

  const displayName = formatCategoryName(name);
  const { t } = useTranslation();
  const countBackground = colors.card;
  const countIconColor = colors.text;
  const placeholderBackground =
    (colors as any).surfaceVariant ?? colors.card ?? colors.surface;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <View
          style={[styles.media, { backgroundColor: placeholderBackground }]}
        >
          <AppImage
            uri={heroImageUrl}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          >
            {activityCount > 0 ? (
              <Box
                background={countBackground}
                paddingHorizontal={spacing.md}
                paddingVertical={spacing.xs}
                rounded="sm"
                style={styles.countBadge}
              >
                <Text
                  variant="caption"
                  weight="700"
                  style={{ color: countIconColor }}
                >
                  {t("activities:list.spotsLabel", { count: activityCount })}
                </Text>
              </Box>
            ) : null}

            {hasCluster ? (
              <Box
                rounded="pill"
                background={colors.card}
                padding={spacing.sm}
                style={[styles.clusterBadge, { shadowColor: colors.text }]}
                shadow="sm"
              >
                <Icon
                  source="map-marker-multiple"
                  size={18}
                  color={colors.primary}
                />
              </Box>
            ) : null}
          </AppImage>
        </View>

        <View style={styles.content}>
          <Text variant="headline" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: spacing.sm / 2,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  countBadge: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  clusterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default CategoryCard;
