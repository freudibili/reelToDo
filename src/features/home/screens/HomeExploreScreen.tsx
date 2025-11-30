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
} from "../store/homeExploreSlice";
import { homeExploreSelectors } from "../store/homeExploreSelectors";

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
  const location = useAppSelector(homeExploreSelectors.location);
  const tripLength = useAppSelector(homeExploreSelectors.tripLength);
  const selectedCategories = useAppSelector(homeExploreSelectors.categories);
  const budget = useAppSelector(homeExploreSelectors.budget);
  const results = useAppSelector(homeExploreSelectors.results);
  const loadingResults = useAppSelector(homeExploreSelectors.loading);
  const hasSearched = useAppSelector(homeExploreSelectors.hasSearched);

  const handleSearch = () => {
    dispatch(fetchHomeExplore());
  };

  const handleResetFilters = () => {
    dispatch(resetSuggestions());
  };

  return (
    <Screen
      scrollable
      headerTitle="Plan something"
      backgroundColor={colors.background}
      flushBottom
      loading={loadingResults}
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
            loading={loadingResults}
            hasSearched={hasSearched}
            onChangeFilters={handleResetFilters}
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
