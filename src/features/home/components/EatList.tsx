import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EatSpot } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type EatListProps = {
  places: EatSpot[];
};

const EatList: React.FC<EatListProps> = ({ places }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.list}>
      {places.map((place) => (
        <View
          key={place.id}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {place.name}
            </Text>
            <View
              style={[
                styles.budgetTag,
                {
                  backgroundColor: colors.accentSurface,
                  borderColor: colors.accentBorder,
                },
              ]}
            >
              <Text style={[styles.budgetText, { color: colors.accentText }]}>
                {place.budget}
              </Text>
            </View>
          </View>
          <Text style={[styles.category, { color: colors.mutedText }]}>
            {place.category} · {place.distance}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {place.description}
          </Text>
          <Pressable
            style={[
              styles.cta,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.accentText }]}>
              View details
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default EatList;

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  budgetTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
