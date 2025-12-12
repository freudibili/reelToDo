import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { Box, Chip, Stack, Text, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface MapHeaderProps {
  title: string;
  allLabel: string;
  categories: string[];
  selectedCategory: string | null;
  onChangeCategory: (next: string | null) => void;
  renderCategoryLabel: (category: string) => string;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  title,
  allLabel,
  categories,
  selectedCategory,
  onChangeCategory,
  renderCategoryLabel,
}) => {
  const { colors } = useAppTheme();
  const isAllSelected = selectedCategory === null;

  return (
    <Box
      background={colors.background}
      style={[styles.header, { borderBottomColor: colors.border }]}
    >
      <Box paddingHorizontal="md" paddingTop="md" paddingBottom="xs">
        <Text variant="title1">{title}</Text>
      </Box>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContent}
      >
        <Stack direction="row" gap="xs">
          <Chip
            label={allLabel}
            selected={isAllSelected}
            tone="primary"
            onPress={() => onChangeCategory(null)}
            accessibilityRole="button"
          />

          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Chip
                key={category}
                label={renderCategoryLabel(category)}
                selected={isSelected}
                tone="primary"
                onPress={() => onChangeCategory(category)}
                accessibilityRole="button"
              />
            );
          })}
        </Stack>
      </ScrollView>
    </Box>
  );
};

export default MapHeader;

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chipContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
