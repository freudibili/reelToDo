import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SleepSpot } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type SleepListProps = {
  places: SleepSpot[];
};

const SleepList: React.FC<SleepListProps> = ({ places }) => {
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
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                {place.name}
              </Text>
              <Text style={[styles.type, { color: colors.mutedText }]}>
                {place.type}
              </Text>
            </View>
            <View
              style={[
                styles.priceTag,
                { backgroundColor: colors.accentSurface, borderColor: colors.accentBorder },
              ]}
            >
              <Text style={[styles.priceText, { color: colors.accentText }]}>
                {place.priceRange}
              </Text>
            </View>
          </View>
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
              Save for later
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default SleepList;

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
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
