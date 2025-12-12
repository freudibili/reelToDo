import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";

interface MapHeaderProps {
  title: string;
  allLabel: string;
  colors: {
    border: string;
    text: string;
    overlay: string;
    primary: string;
    contrastText?: string;
  };
  categories: string[];
  selectedCategory: string | null;
  onChangeCategory: (next: string | null) => void;
  renderCategoryLabel: (category: string) => string;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  title,
  allLabel,
  colors,
  categories,
  selectedCategory,
  onChangeCategory,
  renderCategoryLabel,
}) => {
  const isAllSelected = selectedCategory === null;

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.headerContent}
      >
        <Pressable
          onPress={() => onChangeCategory(null)}
          style={[
            styles.chip,
            {
              backgroundColor: colors.overlay,
              borderColor: colors.border,
            },
            isAllSelected && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.text },
              isAllSelected && { color: colors.contrastText ?? colors.text },
            ]}
          >
            {allLabel}
          </Text>
        </Pressable>

        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => onChangeCategory(category)}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.overlay,
                  borderColor: colors.border,
                },
                isSelected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.text },
                  isSelected && { color: colors.contrastText ?? colors.text },
                ]}
              >
                {renderCategoryLabel(category)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MapHeader;

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 22,
    fontWeight: "700",
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
  },
});
