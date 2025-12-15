import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { Box, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import CategoryFilterList from "./CategoryFilterList";

interface MapHeaderProps {
  allLabel: string;
  categories: string[];
  selectedCategory: string | null;
  onChangeCategory: (next: string | null) => void;
  renderCategoryLabel: (category: string) => string;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  allLabel,
  categories,
  selectedCategory,
  onChangeCategory,
  renderCategoryLabel,
}) => {
  const { colors } = useAppTheme();
  return (
    <Box
      background={colors.background}
      style={[styles.header, { borderBottomColor: colors.border }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContent}
      >
        <CategoryFilterList
          allLabel={allLabel}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={onChangeCategory}
          renderCategoryLabel={renderCategoryLabel}
        />
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
