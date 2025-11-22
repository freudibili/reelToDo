import { supabase } from "@config/supabase";
import type { ShareIntent } from "expo-share-intent";
import type { Activity } from "@features/activities/utils/types";
import type { UpdateActivityPayload } from "../utils/types";
import i18next from "@common/i18n/i18n";

interface AnalyzeArgs {
  shared: ShareIntent;
  userId: string;
}

export const importService = {
  analyze: async ({ shared, userId }: AnalyzeArgs): Promise<Activity> => {
    const url = shared?.webUrl;
    if (!url) throw new Error(i18next.t("import:errors.analyze"));

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
    if (!data) throw new Error(i18next.t("import:errors.analyze"));
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
  payload: UpdateActivityPayload
): Promise<Activity> => {
  const update: Record<string, unknown> = {};

  if (payload.location) {
    update.location_name = payload.location.name;
    update.address = payload.location.formattedAddress;
    update.city = payload.location.city;
    update.country = payload.location.country;
    update.latitude = payload.location.latitude;
    update.longitude = payload.location.longitude;
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
