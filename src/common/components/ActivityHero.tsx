import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-paper";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
import { useAppTheme } from "@common/theme/appTheme";
import AppImage from "./AppImage";

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
  const displayCategory = category
    ? formatCategoryName(category)
    : fallbackTitle;
  const chips = [location, dateLabel].filter(Boolean) as string[];

  return (
    <View style={styles.container}>
      <AppImage uri={imageUrl} style={styles.image} resizeMode="cover">
        {onToggleFavorite && (
          <Pressable style={styles.favoriteBtn} onPress={onToggleFavorite}>
            <Icon
              source={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? colors.favorite : colors.background}
            />
          </Pressable>
        )}

        {showOverlayContent && (
          <View style={styles.overlayContent}>
            <Text style={styles.category}>{displayCategory}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {displayTitle}
            </Text>

            {chips.length > 0 && (
              <View style={styles.chipRow}>
                {chips.map((chip, idx) => (
                  <View style={styles.chip} key={`${chip}-${idx}`}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </AppImage>
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
  image: {
    width: "100%",
    height: 210,
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
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
