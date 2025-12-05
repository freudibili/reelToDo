import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-paper";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { useAppTheme } from "@common/theme/appTheme";

interface ActivityHeroProps {
  title: string;
  category?: string | null;
  location?: string | null;
  dateLabel?: string | null;
  imageUrl?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showOverlayContent?: boolean;
}

const ActivityHero: React.FC<ActivityHeroProps> = ({
  title,
  category,
  location,
  dateLabel,
  imageUrl,
  isFavorite,
  onToggleFavorite,
  showOverlayContent = true,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const fallbackTitle = t("labels.activity");
  const displayTitle = title || fallbackTitle;
  const displayCategory = category ? formatCategoryName(category) : fallbackTitle;
  const chips = [location, dateLabel].filter(Boolean) as string[];
  const initial =
    title?.trim()?.[0]?.toUpperCase() ||
    fallbackTitle?.trim()?.[0]?.toUpperCase() ||
    "A";

  const renderHeroContent = () => (
    <View style={styles.overlayContent}>
      <Text style={styles.category}>{displayCategory}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {displayTitle}
      </Text>
      {chips.length > 0 ? (
        <View style={styles.chipRow}>
          {chips.map((chip, idx) => (
            <View style={styles.chip} key={`${chip}-${idx}`}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.cover}
          resizeMode="cover"
          imageStyle={styles.coverImage}
        >
          <View style={styles.scrim} />
          {onToggleFavorite ? (
            <Pressable style={styles.favoriteBtn} onPress={onToggleFavorite}>
              <Icon
                source={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? colors.favorite : colors.background}
              />
            </Pressable>
          ) : null}
          {showOverlayContent ? renderHeroContent() : null}
        </ImageBackground>
      ) : (
        <View style={[styles.cover, styles.placeholder]}>
          <Text style={styles.placeholderInitial}>{initial}</Text>
          {onToggleFavorite ? (
            <Pressable style={styles.favoriteBtn} onPress={onToggleFavorite}>
              <Icon
                source={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={colors.favorite}
              />
            </Pressable>
          ) : null}
          {showOverlayContent ? renderHeroContent() : null}
        </View>
      )}
    </View>
  );
};

export default ActivityHero;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  cover: {
    height: 210,
    position: "relative",
    padding: 12,
  },
  coverImage: {
    borderRadius: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  placeholder: {
    backgroundColor: "#0f172a",
    justifyContent: "flex-end",
  },
  placeholderInitial: {
    position: "absolute",
    top: 18,
    left: 18,
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    opacity: 0.3,
  },
  overlayContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  category: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 26,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
