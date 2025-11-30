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
};
