import { supabase } from "@config/supabase";
import type { ShareIntent } from "expo-share-intent";
import type { Activity } from "@features/activities/utils/types";
import type { UpdateActivityPayload } from "../utils/types";
import i18next from "@common/i18n/i18n";

interface AnalyzeArgs {
  shared: ShareIntent;
  userId: string;
}

const extractFunctionErrorMessage = (err: any): string | null => {
  const parseCandidate = (candidate: unknown): string | null => {
    if (!candidate) return null;

    if (typeof candidate === "object") {
      const msg =
        (candidate as any).message ??
        (candidate as any).reason ??
        (candidate as any).error;
      if (typeof msg === "string") return msg;
      // fall through to stringification below
    }

    if (typeof candidate === "string") {
      try {
        const parsed = JSON.parse(candidate);
        const parsedMsg =
          (parsed as any)?.message ??
          (parsed as any)?.reason ??
          (parsed as any)?.error;
        if (typeof parsedMsg === "string") return parsedMsg;
      } catch {
        // not JSON
      }
      return candidate;
    }

    return null;
  };

  const contexts = [err?.context?.body, err?.message, err];
  for (const candidate of contexts) {
    const parsed = parseCandidate(candidate);
    if (parsed) return parsed;
  }

  return null;
};

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

    if (error) {
      const message =
        extractFunctionErrorMessage(error) ??
        i18next.t("import:errors.analyze");
      throw new Error(message);
    }
    if (!data) throw new Error(i18next.t("import:errors.analyze"));
    return data as Activity;
  },

  ensureOwner: async (
    activityId: string,
    userId: string
  ): Promise<{ user_id: string } | null> => {
    const { data, error } = await supabase
      .from("activities")
      .update({ user_id: userId })
      .eq("id", activityId)
      .is("user_id", null)
      .select("user_id")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = No rows updated; ignore when already owned
      throw error;
    }

    return data ?? null;
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
      dates: [dateIso],
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
    update.dates = [payload.dateIso];
    update.needs_date_confirmation = false;
  } else if (payload.dateIso === null) {
    update.dates = [];
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
