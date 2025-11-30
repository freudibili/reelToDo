import React, { useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const countBackground =
    mode === "dark" ? "rgba(15,23,42,0.78)" : "rgba(15,23,42,0.16)";
  const placeholderBackground =
    (colors as any).surfaceVariant ?? colors.card ?? "#1f2937";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.media}>
          {heroImageUrl ? (
            <Image
              source={{ uri: heroImageUrl }}
              style={StyleSheet.absoluteFillObject}
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

          <LinearGradient
            colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.65)"]}
            locations={[0.6, 1]}
            style={styles.gradient}
          />

          {activityCount > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: countBackground }]}>
              <Text style={styles.countText}>{countLabel} spots</Text>
            </View>
          ) : null}

          {hasCluster ? (
            <View style={[styles.clusterBadge, { backgroundColor: colors.card }]}>
              <Icon source="map-marker-multiple" size={18} color={colors.primary} />
            </View>
          ) : null}

          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
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
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  media: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    backgroundColor: "#111",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
  },
  titleRow: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
