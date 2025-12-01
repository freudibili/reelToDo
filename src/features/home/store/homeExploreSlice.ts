import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";
import type {
  BudgetLevel,
  CategoryTag,
  HomeExploreData,
} from "../mock/homeExploreData";
import { homeExploreData } from "../mock/homeExploreData";
import { HomeExploreService } from "../services/homeExploreService";
import { JourneyService } from "../services/journeyService";
import type { JourneyPlan } from "../types/journey";

type HomeExploreState = {
  location: string;
  tripLength: number;
  categories: CategoryTag[];
  budget: BudgetLevel;
  results: HomeExploreData;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  journey: JourneyPlan | null;
  journeyLoading: boolean;
  journeyError: string | null;
};

const initialState: HomeExploreState = {
  location: "Near me",
  tripLength: 3,
  categories: ["highlights", "food", "cafes"],
  budget: "€€",
  results: homeExploreData,
  loading: false,
  error: null,
  hasSearched: false,
  journey: null,
  journeyLoading: false,
  journeyError: null,
};

export const fetchHomeExplore = createAsyncThunk<
  HomeExploreData,
  void,
  { state: RootState; rejectValue: string }
>("homeExplore/fetch", async (_, { getState, rejectWithValue }) => {
  const state = getState().homeExplore;
  try {
    const data = await HomeExploreService.fetchIdeas({
      location: state.location,
      days: state.tripLength,
      categories: state.categories,
      budget: state.budget,
    });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message ?? "Unable to load ideas");
  }
});

export const generateJourney = createAsyncThunk<
  JourneyPlan,
  void,
  { state: RootState; rejectValue: string }
>("homeExplore/generateJourney", async (_, { getState, rejectWithValue }) => {
  const state = getState().homeExplore;
  const mapCategoryToFilter = (value: CategoryTag): string => {
    if (value === "walks") return "city_walks";
    if (value === "food") return "restaurants";
    if (value === "bars" || value === "nightlife") return "nightlife";
    if (value === "museums") return "museums";
    if (value === "cafes") return "cafes";
    if (value === "hikes") return "hikes";
    if (value === "family") return "family";
    if (value === "markets") return "events";
    return value;
  };
  try {
    const data = await JourneyService.generateJourney({
      location: state.location,
      days: state.tripLength,
      startDate: null,
      categories: state.categories,
      filters: state.categories.map(mapCategoryToFilter),
      budget: state.budget,
    });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message ?? "Unable to generate journey");
  }
});

const clampTripLength = (value: number) => Math.min(Math.max(value, 1), 14);

const homeExploreSlice = createSlice({
  name: "homeExplore",
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setTripLength(state, action: PayloadAction<number>) {
      state.tripLength = clampTripLength(action.payload);
    },
    toggleCategory(state, action: PayloadAction<CategoryTag>) {
      const exists = state.categories.includes(action.payload);
      state.categories = exists
        ? state.categories.filter((c) => c !== action.payload)
        : [...state.categories, action.payload];
    },
    setBudget(state, action: PayloadAction<BudgetLevel>) {
      state.budget = action.payload;
    },
    resetSuggestions(state) {
      state.results = homeExploreData;
      state.hasSearched = false;
      state.error = null;
      state.journey = null;
      state.journeyError = null;
      state.journeyLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeExplore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeExplore.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.hasSearched = true;
      })
      .addCase(fetchHomeExplore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to load ideas";
        state.hasSearched = true;
      })
      .addCase(generateJourney.pending, (state) => {
        state.journeyLoading = true;
        state.journeyError = null;
      })
      .addCase(generateJourney.fulfilled, (state, action) => {
        state.journeyLoading = false;
        state.journey = action.payload;
      })
      .addCase(generateJourney.rejected, (state, action) => {
        state.journeyLoading = false;
        state.journeyError = action.payload ?? "Unable to generate journey";
      });
  },
});

export const {
  setLocation,
  setTripLength,
  toggleCategory,
  setBudget,
  resetSuggestions,
} = homeExploreSlice.actions;

export default homeExploreSlice.reducer;
