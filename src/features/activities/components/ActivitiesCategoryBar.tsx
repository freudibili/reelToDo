import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

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
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => {
          const active = selected === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(cat)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={active ? styles.textActive : styles.text}>
                {cat}
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
    backgroundColor: "#fff",
    zIndex: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f1f1f1",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#000",
  },
  text: {
    color: "#000",
  },
  textActive: {
    color: "#fff",
  },
});
