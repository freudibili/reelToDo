import React, { useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";
import type { CategoryCardItem } from "../utils/categorySummary";
import { formatCategoryName } from "../utils/categorySummary";

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
  const { colors, mode } = useAppTheme();
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
  const countLabel =
    activityCount > 99 ? "99+" : activityCount > 9 ? `+${activityCount}` : `${activityCount}`;
  const countBackground = "rgba(255,255,255,0.85)";
  const countIconColor = "#0f172a";
  const placeholderBackground =
    (colors as any).surfaceVariant ?? colors.card ?? "#1f2937";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <View
          style={[
            styles.media,
            { backgroundColor: placeholderBackground },
          ]}
        >
          {heroImageUrl ? (
            <Image
              source={{ uri: heroImageUrl }}
              style={[StyleSheet.absoluteFillObject, styles.image]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                { backgroundColor: placeholderBackground },
              ]}
            >
              <Icon source="folder-outline" size={32} color={colors.secondaryText} />
            </View>
          )}

          {activityCount > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: countBackground }]}>
              <View style={styles.countRow}>
                <Text style={[styles.countText, { color: countIconColor }]}>
                  {countLabel} spots
                </Text>
              </View>
            </View>
          ) : null}

          {hasCluster ? (
            <View style={[styles.clusterBadge, { backgroundColor: colors.card }]}>
              <Icon source="map-marker-multiple" size={18} color={colors.primary} />
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
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
    borderRadius: 14,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
  },
  image: { borderRadius: 14 },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
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
  countBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: {
    fontWeight: "700",
    fontSize: 12,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clusterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default CategoryCard;
