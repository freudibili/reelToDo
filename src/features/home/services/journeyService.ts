import { supabase } from "@config/supabase";
import type { JourneyPlan } from "../types/journey";
import type { BudgetLevel, CategoryTag } from "../mock/homeExploreData";

export const JourneyService = {
  async generateJourney(params: {
    location: string;
    days: number;
    startDate?: string | null;
    categories: CategoryTag[];
    filters?: string[];
    budget: BudgetLevel;
  }): Promise<JourneyPlan> {
    const { data, error } = await supabase.functions.invoke("journey-plan", {
      body: {
        location: params.location,
        numberOfDays: params.days,
        startDate: params.startDate ?? null,
        filters: params.filters ?? params.categories,
        budget: params.budget,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No journey returned");
    }

    return data as JourneyPlan;
  },
};
