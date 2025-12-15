import React, { useMemo } from "react";

import { Stack } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import {
  getAllCategoryIconName,
  getCategoryIconName,
} from "@features/activities/utils/categoryIcons";

import CategoryFilterItem from "./CategoryFilterItem";

type CategoryFilterListProps = {
  allLabel: string;
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  renderCategoryLabel: (category: string) => string;
};

const CategoryFilterList: React.FC<CategoryFilterListProps> = ({
  allLabel,
  categories,
  selectedCategory,
  onSelect,
  renderCategoryLabel,
}) => {
  const { colors } = useAppTheme();
  const isAllSelected = selectedCategory === null;
  const items = useMemo(
    () => [
      {
        id: null,
        icon: getAllCategoryIconName(),
        label: allLabel,
        selected: isAllSelected,
        onPress: () => onSelect(null),
      },
      ...categories.map((category) => ({
        id: category,
        icon: getCategoryIconName(category),
        label: renderCategoryLabel(category),
        selected: selectedCategory === category,
        onPress: () => onSelect(category),
      })),
    ],
    [allLabel, categories, isAllSelected, onSelect, renderCategoryLabel, selectedCategory]
  );

  return (
    <Stack direction="row" gap="sm">
      {items.map((item) => (
        <CategoryFilterItem
          key={item.id ?? "all"}
          icon={item.icon}
          label={item.label}
          selected={item.selected}
          onPress={item.onPress}
          activeColor={colors.primary}
          inactiveColor={colors.mutedText}
        />
      ))}
    </Stack>
  );
};

export default CategoryFilterList;
