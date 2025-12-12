import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-paper";

import { Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { formatCategoryName } from "@features/activities/utils/categorySummary";
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
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <AppImage uri={imageUrl} style={styles.image} resizeMode="cover">
        {onToggleFavorite && (
          <Pressable
            style={[
              styles.favoriteBtn,
              {
                backgroundColor: colors.overlayStrong,
                borderColor: colors.border,
              },
            ]}
            onPress={onToggleFavorite}
            accessibilityLabel={
              isFavorite
                ? t("accessibility.removeFavorite")
                : t("accessibility.addFavorite")
            }
            accessibilityRole="button"
          >
            <Icon
              source={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? colors.favorite : colors.favoriteContrast}
            />
          </Pressable>
        )}

        {showOverlayContent && (
          <View style={styles.overlayContent}>
            <View
              style={[
                styles.overlayPanel,
                {
                  backgroundColor: colors.backdrop,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text variant="eyebrow" tone="inverse">
                {displayCategory}
              </Text>
              <Text variant="title1" tone="inverse" numberOfLines={2}>
                {displayTitle}
              </Text>

              {chips.length > 0 ? (
                <Stack direction="row" gap="sm" wrap style={styles.chipRow}>
                  {chips.map((chip, idx) => (
                    <View
                      style={[
                        styles.chip,
                        {
                          backgroundColor: colors.overlayStrong,
                          borderColor: colors.border,
                        },
                      ]}
                      key={`${chip}-${idx}`}
                    >
                      <Text variant="bodySmall" tone="inverse" weight="700">
                        {chip}
                      </Text>
                    </View>
                  ))}
                </Stack>
              ) : null}
            </View>
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
  overlayPanel: {
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  chipRow: {
    marginTop: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  favoriteBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
