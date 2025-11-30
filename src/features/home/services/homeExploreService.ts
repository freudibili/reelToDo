import { supabase } from "@config/supabase";
import type {
  BudgetLevel,
  CategoryTag,
  HomeExploreData,
} from "../mock/homeExploreData";

export const HomeExploreService = {
  async fetchIdeas(params: {
    location: string;
    days: number;
    categories: CategoryTag[];
    budget: BudgetLevel;
  }): Promise<HomeExploreData> {
    const { data, error } = await supabase.functions.invoke("home-explore", {
      body: {
        location: params.location,
        days: params.days,
        categories: params.categories,
        budget: params.budget,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No ideas returned");
    }

    return data as HomeExploreData;
  },
};
