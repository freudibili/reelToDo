import React from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Itinerary } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type ItineraryListProps = {
  itineraries: Itinerary[];
  location: string;
  onOpenItinerary?: (itinerary: Itinerary) => void;
};

const ItineraryList: React.FC<ItineraryListProps> = ({
  itineraries,
  location,
  onOpenItinerary,
}) => {
  const { colors } = useAppTheme();

  const openMaps = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  return (
    <View style={styles.list}>
      {itineraries.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {item.mapImageUrl ? (
            <Image source={{ uri: item.mapImageUrl }} style={styles.mapImage} />
          ) : null}
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.accentSurface, borderColor: colors.accentBorder },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.accentText }]}>
                {item.days}d
              </Text>
            </View>
          </View>
          <Text style={[styles.location, { color: colors.mutedText }]}>
            {location}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>
          {item.directions?.distanceText || item.directions?.durationText ? (
            <View
              style={[
                styles.directionsRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.directionsText, { color: colors.mutedText }]}>
                {item.directions?.distanceText ? `${item.directions.distanceText} • ` : ""}
                {item.directions?.durationText ?? ""}
              </Text>
            </View>
          ) : null}
          <View style={styles.stops}>
            {item.stops.map((stop, idx) => (
              <View
                key={stop}
                style={[
                  styles.stopRow,
                  { borderColor: colors.border },
                  idx === item.stops.length - 1 && styles.lastStopRow,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.accent, opacity: 0.8 },
                  ]}
                />
                <Text style={[styles.stopText, { color: colors.text }]}>
                  {stop}
                </Text>
              </View>
            ))}
          </View>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.accent, shadowColor: colors.accent },
            ]}
            onPress={() =>
              onOpenItinerary ? onOpenItinerary(item) : openMaps(item.mapsUrl)
            }
          >
            <Text style={styles.buttonText}>
              {onOpenItinerary ? "Open journey" : item.mapsUrl ? "Open in Google Maps" : "See itinerary"}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default ItineraryList;

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  mapImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  location: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  stops: {
    gap: 8,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastStopRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  stopText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  directionsRow: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
