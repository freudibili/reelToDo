import React, { useMemo } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "@common/components/AppScreen";
import { useAppTheme } from "@common/theme/appTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppSelector } from "@core/store/hook";
import { homeExploreSelectors } from "../store/homeExploreSelectors";
import type { Itinerary } from "../mock/homeExploreData";
import type { JourneyPlan, JourneyDay } from "../types/journey";

const JourneyScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const itineraryId = params.id ?? "";

  const itinerary = useAppSelector(homeExploreSelectors.itineraryById(itineraryId));
  const journey = useAppSelector(homeExploreSelectors.journey);
  const fallbackLocation = useAppSelector(homeExploreSelectors.location);
  const resultsLocation = useAppSelector((state) => state.homeExplore.results.location);
  const locationLabel = resultsLocation ?? fallbackLocation;

  const stops = useMemo(() => itinerary?.stops ?? [], [itinerary]);

  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  const activeJourney: JourneyPlan | null =
    itineraryId === "latest" && journey ? journey : null;

  if (!itinerary && !activeJourney) {
    return (
      <Screen
        headerTitle="Journey"
        onBackPress={() => router.back()}
        backgroundColor={colors.background}
      >
        <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No journey found</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedText }]}>
            Start a search from Home and open a journey to see details here.
          </Text>
          <Pressable
            style={[
              styles.cta,
              { backgroundColor: colors.accent, shadowColor: colors.accent },
            ]}
            onPress={() => router.push("/(app)/(tabs)/home")}
          >
            <Text style={styles.ctaText}>Go to Home</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (activeJourney) {
    const renderDay = (day: JourneyDay) => (
      <View key={day.day} style={[styles.dayCard, { borderColor: colors.border }]}>
        <Text style={[styles.dayTitle, { color: colors.text }]}>
          Day {day.day}: {day.title}
        </Text>
        <View style={styles.dayActivities}>
          {day.activities.map((act, idx) => (
            <View
              key={`${day.day}-${idx}-${act.name}`}
              style={[styles.activityRow, { borderColor: colors.border }]}
            >
              <View style={styles.activityHeader}>
                <Text style={[styles.activityTime, { color: colors.mutedText }]}>
                  {act.timeOfDay}
                </Text>
                <Text style={[styles.activityType, { color: colors.secondaryText }]}>
                  {act.type}
                </Text>
              </View>
              <Text style={[styles.activityName, { color: colors.text }]}>{act.name}</Text>
              <Text style={[styles.activityDesc, { color: colors.text }]}>{act.description}</Text>
              <Text style={[styles.activityWhy, { color: colors.mutedText }]}>
                Why: {act.why}
              </Text>
              <Text style={[styles.activityMeta, { color: colors.mutedText }]}>
                {act.duration ? `${act.duration} • ` : ""}
                {act.price ?? "€€"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );

    return (
      <Screen
        headerTitle="Journey"
        onBackPress={() => router.back()}
        backgroundColor={colors.background}
        flushBottom
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>{activeJourney.title}</Text>
                <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                  {activeJourney.destination} · {activeJourney.numberOfDays} days
                </Text>
              </View>
              <Pressable
                style={[
                  styles.tag,
                  { backgroundColor: colors.accentSurface, borderColor: colors.accentBorder },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.accentText }]}>
                  {activeJourney.tags.slice(0, 2).join(" · ")}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              {activeJourney.summary}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Budget: {activeJourney.budget ?? "n/a"} • Confidence: {activeJourney.confidence.toFixed(2)}
            </Text>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Days</Text>
              {activeJourney.days.map(renderDay)}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Where to eat</Text>
              {activeJourney.whereToEat.map((item) => (
                <Text key={item.name} style={[styles.listItem, { color: colors.text }]}>
                  • {item.name} ({item.price ?? "€€"})
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Where to sleep</Text>
              {activeJourney.whereToSleep.map((item) => (
                <Text key={item.name} style={[styles.listItem, { color: colors.text }]}>
                  • {item.name} ({item.price ?? "€€"})
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Events</Text>
              {activeJourney.events.map((item) => (
                <Text key={item.name} style={[styles.listItem, { color: colors.text }]}>
                  • {item.name} ({item.price ?? "€€"})
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Points of interest</Text>
              {activeJourney.points.map((item) => (
                <Text key={item.name} style={[styles.listItem, { color: colors.text }]}>
                  • {item.name} ({item.price ?? "€€"})
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Packing list</Text>
              {activeJourney.packingList.map((item) => (
                <Text key={item} style={[styles.listItem, { color: colors.text }]}>
                  • {item}
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Local tips</Text>
              {activeJourney.localTips.map((item) => (
                <Text key={item} style={[styles.listItem, { color: colors.text }]}>
                  • {item}
                </Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Transport</Text>
              {activeJourney.transportAdvice.map((item) => (
                <Text key={item} style={[styles.listItem, { color: colors.text }]}>
                  • {item}
                </Text>
              ))}
            </View>
            {activeJourney.safetyOrWeatherNotes?.length ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Safety / Weather
                </Text>
                {activeJourney.safetyOrWeatherNotes.map((item) => (
                  <Text key={item} style={[styles.listItem, { color: colors.text }]}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Google queries</Text>
              <Text style={[styles.listItem, { color: colors.text }]}>
                Restaurants: {activeJourney.googleQueries.restaurants.join("; ")}
              </Text>
              <Text style={[styles.listItem, { color: colors.text }]}>
                Activities: {activeJourney.googleQueries.activities.join("; ")}
              </Text>
              <Text style={[styles.listItem, { color: colors.text }]}>
                Hotels: {activeJourney.googleQueries.hotels.join("; ")}
              </Text>
              <Text style={[styles.listItem, { color: colors.text }]}>
                Events: {activeJourney.googleQueries.events.join("; ")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Journey"
      onBackPress={() => router.back()}
      backgroundColor={colors.background}
      flushBottom
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {itinerary.mapImageUrl ? (
            <Image source={{ uri: itinerary.mapImageUrl }} style={styles.mapImage} />
          ) : null}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>{itinerary.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                {locationLabel} · {itinerary.days} day{itinerary.days > 1 ? "s" : ""}
              </Text>
            </View>
            <Pressable
              style={[
                styles.tag,
                { backgroundColor: colors.accentSurface, borderColor: colors.accentBorder },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.accentText }]}>
                {itinerary.tags.slice(0, 2).join(" · ")}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            {itinerary.description}
          </Text>
          {itinerary.directions?.distanceText || itinerary.directions?.durationText ? (
            <View
              style={[
                styles.directionRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.directionText, { color: colors.mutedText }]}>
                {itinerary.directions?.distanceText ? `${itinerary.directions.distanceText} • ` : ""}
                {itinerary.directions?.durationText ?? ""}
              </Text>
            </View>
          ) : null}
          <View style={styles.stops}>
            {stops.map((stop, idx) => (
              <View
                key={stop}
                style={[
                  styles.stopRow,
                  { borderColor: colors.border },
                  idx === stops.length - 1 && styles.lastStop,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.accent, opacity: idx === 0 ? 1 : 0.6 },
                  ]}
                />
                <Text style={[styles.stopText, { color: colors.text }]}>{stop}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.primary,
                { backgroundColor: colors.accent, shadowColor: colors.accent },
              ]}
              onPress={() => openUrl(itinerary.mapsUrl || itinerary.directions?.url)}
            >
              <Text style={styles.primaryText}>Open in Google Maps</Text>
            </Pressable>
            {itinerary.mapImageUrl ? (
              <Pressable
                style={[
                  styles.secondary,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
                onPress={() => openUrl(itinerary.mapImageUrl)}
              >
                <Text style={[styles.secondaryText, { color: colors.accentText }]}>
                  View map snapshot
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default JourneyScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mapImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  section: {
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  listItem: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  dayCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 8,
  },
  dayTitle: {
    fontSize: 14.5,
    fontWeight: "800",
  },
  dayActivities: {
    gap: 8,
  },
  activityRow: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 4,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityTime: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  activityType: {
    fontSize: 12,
    fontWeight: "700",
  },
  activityName: {
    fontSize: 14,
    fontWeight: "800",
  },
  activityDesc: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  activityWhy: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  activityMeta: {
    fontSize: 12,
    fontWeight: "700",
  },
  directionRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  directionText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  stops: {
    gap: 8,
  },
  stopRow: {
    flexDirection: "row",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  lastStop: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  stopText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  actions: {
    gap: 8,
  },
  primary: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondary: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  empty: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  cta: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
