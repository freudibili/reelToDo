import React from "react";
import { StyleSheet, View } from "react-native";
import Screen from "@common/components/AppScreen";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import LocationCard from "../components/LocationCard";
import FiltersSection from "../components/FiltersSection";
import ResultsSection from "../components/ResultsSection";
import { BudgetLevel, CategoryTag } from "../mock/homeExploreData";
import {
  setLocation,
  setTripLength,
  toggleCategory,
  setBudget,
  resetSuggestions,
  fetchHomeExplore,
  generateJourney,
} from "../store/homeExploreSlice";
import { homeExploreSelectors } from "../store/homeExploreSelectors";
import { useRouter } from "expo-router";

const categoryOptions: { label: string; value: CategoryTag }[] = [
  { label: "Highlights", value: "highlights" },
  { label: "City walks", value: "walks" },
  { label: "Hikes", value: "hikes" },
  { label: "Museums", value: "museums" },
  { label: "Restaurants", value: "food" },
  { label: "Cafés", value: "cafes" },
  { label: "Bars", value: "bars" },
  { label: "Markets", value: "markets" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Family", value: "family" },
  { label: "Design", value: "design" },
];

const budgetLevels: BudgetLevel[] = ["€", "€€", "€€€"];

const HomeExploreScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const location = useAppSelector(homeExploreSelectors.location);
  const tripLength = useAppSelector(homeExploreSelectors.tripLength);
  const selectedCategories = useAppSelector(homeExploreSelectors.categories);
  const budget = useAppSelector(homeExploreSelectors.budget);
  const results = useAppSelector(homeExploreSelectors.results);
  const loadingResults = useAppSelector(homeExploreSelectors.loading);
  const hasSearched = useAppSelector(homeExploreSelectors.hasSearched);
  const journeyLoading = useAppSelector(homeExploreSelectors.journeyLoading);
  const journey = useAppSelector(homeExploreSelectors.journey);

  const handleSearch = () => {
    dispatch(fetchHomeExplore());
    dispatch(generateJourney());
  };

  const handleResetFilters = () => {
    dispatch(resetSuggestions());
  };

  const handleOpenItinerary = (id: string) => {
    router.push({ pathname: "/journeys/[id]", params: { id } });
  };

  return (
    <Screen
      scrollable
      headerTitle="Plan something"
      backgroundColor={colors.background}
      flushBottom
      loading={loadingResults || journeyLoading}
    >
      <View style={styles.stack}>
        <LocationCard
          location={location}
          onLocationChange={(value) => dispatch(setLocation(value))}
          tripLength={tripLength}
          onTripLengthChange={(value) => dispatch(setTripLength(value))}
        />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <FiltersSection
            categories={categoryOptions}
            selectedCategories={selectedCategories}
            onToggleCategory={(value) => dispatch(toggleCategory(value))}
            budgetLevels={budgetLevels}
            budget={budget}
            onBudgetChange={(value) => dispatch(setBudget(value))}
            onSearch={handleSearch}
            loading={loadingResults}
          />
        </View>
        <View
          style={[
            styles.resultsCard,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <ResultsSection
            results={results}
            location={location}
            loading={loadingResults || journeyLoading}
            hasSearched={hasSearched}
            onChangeFilters={handleResetFilters}
            onOpenJourney={journey ? () => router.push({ pathname: "/journeys/[id]", params: { id: "latest" } }) : undefined}
            onOpenItinerary={handleOpenItinerary}
          />
        </View>
      </View>
    </Screen>
  );
};

export default HomeExploreScreen;

const styles = StyleSheet.create({
  stack: {
    gap: 14,
    paddingBottom: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resultsCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
