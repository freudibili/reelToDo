import React from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { EventSpot, PoiSpot } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type SpotListProps = {
  titleLabel?: string;
  items: (EventSpot | PoiSpot)[];
};

const SpotList: React.FC<SpotListProps> = ({ items }) => {
  const { colors } = useAppTheme();

  const openMaps = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.image} />
          ) : null}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.category, { color: colors.mutedText }]}>
              {item.category} · {item.distance}
            </Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>
          <Pressable
            style={[
              styles.cta,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => openMaps(item.mapsUrl)}
          >
            <Text style={[styles.ctaText, { color: colors.accentText }]}>
              {item.mapsUrl ? "Open in Maps" : "More details"}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default SpotList;

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
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
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
