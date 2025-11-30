import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";
import type {
  BudgetLevel,
  CategoryTag,
  HomeExploreData,
} from "../mock/homeExploreData";
import { homeExploreData } from "../mock/homeExploreData";
import { HomeExploreService } from "../services/homeExploreService";

type HomeExploreState = {
  location: string;
  tripLength: number;
  categories: CategoryTag[];
  budget: BudgetLevel;
  results: HomeExploreData;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
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
