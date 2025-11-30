import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PackingItem } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type PackingListProps = {
  items: PackingItem[];
};

const PackingList: React.FC<PackingListProps> = ({ items }) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
          {item.detail ? (
            <Text style={[styles.detail, { color: colors.mutedText }]}>
              {item.detail}
            </Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
};

export default PackingList;

const styles = StyleSheet.create({
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
  },
  detail: {
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
});
