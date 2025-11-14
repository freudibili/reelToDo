import { supabase } from "@config/supabase";
import type { ShareIntent } from "expo-share-intent";
import type { Activity } from "@features/activities/utils/types";

interface AnalyzeArgs {
  shared: ShareIntent;
  userId: string;
}

export const importService = {
  analyze: async ({ shared, userId }: AnalyzeArgs): Promise<Activity> => {
    console.log("Analyzing shared link:", shared?.webUrl);
    const url = shared?.webUrl;
    if (!url) throw new Error("Missing URL");

    const metadata = shared?.meta
      ? {
          title: shared.meta.title,
          description: [shared.text, shared.meta.description]
            .filter(Boolean)
            .join(" "),
          thumbnail_url: shared.meta.image,
          author_name: shared.meta.siteName,
        }
      : undefined;

    const { data, error } = await supabase.functions.invoke("analyze-post", {
      body: { url, user_id: userId, metadata },
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No data returned");
    return data as Activity;
  },
};

export const markActivityLocationConfirmed = async (
  activityId: string
): Promise<Activity> => {
  const { data, error } = await supabase
    .from("activities")
    .update({
      needs_location_confirmation: false,
    })
    .eq("id", activityId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Activity;
};

export const markActivityDateConfirmed = async (
  activityId: string,
  dateIso: string
): Promise<Activity> => {
  const { data, error } = await supabase
    .from("activities")
    .update({
      main_date: dateIso,
      needs_date_confirmation: false,
    })
    .eq("id", activityId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Activity;
};

export const updateImportedActivityDetails = async (
  activityId: string,
  payload: {
    locationName: string;
    city: string;
    dateIso: string | null;
  }
): Promise<Activity> => {
  const update: Record<string, unknown> = {
    location_name: payload.locationName || null,
    city: payload.city || null,
  };

  if (payload.locationName || payload.city) {
    update.needs_location_confirmation = false;
  }

  if (payload.dateIso) {
    update.main_date = payload.dateIso;
    update.needs_date_confirmation = false;
  }

  const { data, error } = await supabase
    .from("activities")
    .update(update)
    .eq("id", activityId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Activity;
};
