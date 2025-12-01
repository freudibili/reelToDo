import type { RootState } from "@core/store";

export const homeExploreSelectors = {
  location: (state: RootState) => state.homeExplore.location,
  tripLength: (state: RootState) => state.homeExplore.tripLength,
  categories: (state: RootState) => state.homeExplore.categories,
  budget: (state: RootState) => state.homeExplore.budget,
  results: (state: RootState) => state.homeExplore.results,
  loading: (state: RootState) => state.homeExplore.loading,
  hasSearched: (state: RootState) => state.homeExplore.hasSearched,
  error: (state: RootState) => state.homeExplore.error,
  journey: (state: RootState) => state.homeExplore.journey,
  journeyLoading: (state: RootState) => state.homeExplore.journeyLoading,
  journeyError: (state: RootState) => state.homeExplore.journeyError,
  itineraryById:
    (id: string) =>
    (state: RootState) =>
      state.homeExplore.results.itineraries.find((it) => it.id === id) ?? null,
};
