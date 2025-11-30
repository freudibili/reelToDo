import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BudgetLevel, CategoryTag } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type FilterCategory = {
  label: string;
  value: CategoryTag;
};

type FiltersSectionProps = {
  categories: FilterCategory[];
  selectedCategories: CategoryTag[];
  onToggleCategory: (value: CategoryTag) => void;
  budgetLevels: BudgetLevel[];
  budget: BudgetLevel;
  onBudgetChange: (value: BudgetLevel) => void;
  onSearch: () => void;
  loading?: boolean;
};

const FiltersSection: React.FC<FiltersSectionProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  budgetLevels,
  budget,
  onBudgetChange,
  onSearch,
  loading = false,
}) => {
  const { colors } = useAppTheme();

  const renderChip = (item: FilterCategory) => {
    const active = selectedCategories.includes(item.value);
    return (
      <Pressable
        key={item.value}
        onPress={() => onToggleCategory(item.value)}
        style={[
          styles.chip,
          {
            borderColor: active ? colors.accentBorder : colors.border,
            backgroundColor: active ? colors.accentSurface : colors.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? colors.accentText : colors.text },
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Tailor what you want to see
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.mutedText }]}>
          What are you looking for?
        </Text>
        <View style={styles.chipGrid}>{categories.map(renderChip)}</View>
      </View>

      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.mutedText }]}>
          Budget
        </Text>
        <View
          style={[
            styles.segment,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {budgetLevels.map((level) => {
            const active = level === budget;
            return (
              <Pressable
                key={level}
                onPress={() => onBudgetChange(level)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: active
                      ? colors.accentSurface
                      : colors.surface,
                    borderColor: active ? colors.accentBorder : colors.surface,
                    borderWidth: active ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.accentText : colors.text },
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onSearch}
        style={[
          styles.searchBtn,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.primary,
            opacity: loading ? 0.8 : 1,
          },
        ]}
        disabled={loading}
      >
        <Text style={styles.searchText}>
          {loading ? "Searching..." : "Search ideas"}
        </Text>
      </Pressable>
    </View>
  );
};

export default FiltersSection;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  block: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  segment: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "800",
  },
  searchBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
