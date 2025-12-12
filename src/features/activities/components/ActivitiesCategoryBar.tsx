import React from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";

import { Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import { formatCategoryName } from "../utils/categorySummary";

interface Props {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

const ActivitiesCategoryBar: React.FC<Props> = ({
  categories,
  selected,
  onSelect,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => {
          const active = selected === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.overlay,
                  borderColor: active ? colors.primaryBorder : colors.border,
                },
              ]}
            >
              <Text
                variant="bodyStrong"
                style={{
                  color: active ? colors.favoriteContrast : colors.text,
                }}
              >
                {formatCategoryName(cat)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ActivitiesCategoryBar;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
