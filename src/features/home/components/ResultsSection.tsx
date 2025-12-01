import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ItineraryList from "./ItineraryList";
import EatList from "./EatList";
import SleepList from "./SleepList";
import PackingList from "./PackingList";
import SpotList from "./SpotList";
import { HomeExploreData } from "../mock/homeExploreData";
import { useAppTheme } from "@common/theme/appTheme";

type ResultsSectionProps = {
  results: HomeExploreData;
  location: string;
  loading: boolean;
  hasSearched: boolean;
  onChangeFilters: () => void;
  onOpenItinerary?: (id: string) => void;
  onOpenJourney?: () => void;
};

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  location,
  loading,
  hasSearched,
  onChangeFilters,
  onOpenItinerary,
  onOpenJourney,
}) => {
  const { colors } = useAppTheme();

  const renderSection = (
    title: string,
    subtitle: string,
    hasItems: boolean,
    content: React.ReactNode,
    emptyMessage: string
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>
          {subtitle}
        </Text>
      </View>
      {hasItems ? (
        content
      ) : (
        <View
          style={[
            styles.emptyBlock,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            {emptyMessage}
          </Text>
          <Pressable onPress={onChangeFilters}>
            <Text style={[styles.linkText, { color: colors.accentText }]}>
              Change filters
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (!hasSearched && !loading) {
    const teaserItinerary = results.itineraries[0];
    const teaserEat = results.eats[0];

    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Discover ideas around {location}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedText }]}>
          Set where you are going, pick what you like, and we will bundle
          itineraries, food, sleep, and prep tips.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teaserRow}
        >
          {teaserItinerary ? (
            <View
              style={[
                styles.teaserCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.teaserLabel, { color: colors.mutedText }]}>
                Itinerary preview
              </Text>
              <Text style={[styles.teaserTitle, { color: colors.text }]}>
                {teaserItinerary.title}
              </Text>
              <Text style={[styles.teaserBody, { color: colors.secondaryText }]}>
                {teaserItinerary.stops[0]}
              </Text>
            </View>
          ) : null}
          {teaserEat ? (
            <View
              style={[
                styles.teaserCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.teaserLabel, { color: colors.mutedText }]}>
                Bite to try
              </Text>
              <Text style={[styles.teaserTitle, { color: colors.text }]}>
                {teaserEat.name}
              </Text>
              <Text style={[styles.teaserBody, { color: colors.secondaryText }]}>
                {teaserEat.description}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>
          Ideas for {results.location ?? location}
        </Text>
        <Text style={[styles.resultsSubtitle, { color: colors.mutedText }]}>
          Mix and match itineraries, food, stays, and packing prep.
        </Text>
        {onOpenJourney ? (
          <Pressable
            style={[
              styles.journeyCta,
              { backgroundColor: colors.accent, shadowColor: colors.accent },
            ]}
            onPress={onOpenJourney}
          >
            <Text style={styles.journeyCtaText}>Open generated journey</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Pulling suggestions...
          </Text>
        </View>
      ) : (
        <>
          {renderSection(
            "Itineraries",
            "Ready-made days you can follow",
            results.itineraries.length > 0,
            <ItineraryList
              itineraries={results.itineraries}
              location={location}
              onOpenItinerary={(itinerary) => onOpenItinerary?.(itinerary.id)}
            />,
            "No itineraries found with these filters yet."
          )}
          {renderSection(
            "Where to eat",
            "Restaurants and cafés with the right vibe",
            results.eats.length > 0,
            <EatList places={results.eats} />,
            "No food spots match this budget. Try broadening it."
          )}
          {renderSection(
            "Events",
            "Live shows, pop-ups, and happenings",
            results.events.length > 0,
            <SpotList items={results.events} />,
            "No events matched this search yet."
          )}
          {renderSection(
            "Where to sleep",
            "A few places to rest",
            results.sleeps.length > 0,
            <SleepList places={results.sleeps} />,
            "No stays fit these filters. Soften the tags or budget."
          )}
          {renderSection(
            "Points of interest",
            "Landmarks and viewpoints worth a stop",
            results.points.length > 0,
            <SpotList items={results.points} />,
            "No nearby sights matched yet."
          )}
          {renderSection(
            "What to bring",
            "Prep and packing helpers",
            results.packing.length > 0,
            <PackingList items={results.packing} />,
            "No prep tips here yet. Try another focus."
          )}
        </>
      )}
    </View>
  );
};

export default ResultsSection;

const styles = StyleSheet.create({
  wrapper: {
    gap: 18,
  },
  resultsHeader: {
    gap: 6,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  resultsSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  journeyCta: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  journeyCtaText: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  emptyBlock: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "800",
  },
  emptyState: {
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  teaserRow: {
    gap: 10,
    paddingRight: 4,
  },
  teaserCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 6,
  },
  teaserLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  teaserTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  teaserBody: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  loading: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
