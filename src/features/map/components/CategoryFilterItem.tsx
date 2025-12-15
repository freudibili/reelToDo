import React from "react";
import { StyleSheet } from "react-native";

import { Stack, Text } from "@common/designSystem";

import CategoryIconButton from "./CategoryIconButton";

type CategoryFilterItemProps = {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
};

const CategoryFilterItem: React.FC<CategoryFilterItemProps> = ({
  icon,
  label,
  selected,
  onPress,
  activeColor,
  inactiveColor,
}) => {
  return (
    <Stack align="center" gap="xxs" style={styles.container}>
      <CategoryIconButton
        icon={icon}
        label={label}
        selected={selected}
        onPress={onPress}
      />
      <Text
        variant="caption"
        numberOfLines={2}
        style={[
          styles.label,
          {
            color: selected ? activeColor : inactiveColor,
          },
        ]}
      >
        {label}
      </Text>
    </Stack>
  );
};

export default CategoryFilterItem;

const styles = StyleSheet.create({
  container: {
    minWidth: 56,
  },
  label: {
    textAlign: "center",
    maxWidth: 64,
  },
});
