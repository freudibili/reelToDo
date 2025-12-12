import { supabase } from "@config/supabase";
import type { PlaceDetails } from "@features/import/types";

import type { Activity } from "../types";

export const ActivitiesService = {
  async fetchActivities(userId?: string | null) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("user_activities")
      .select(
        `
        activity_id,
        activity_date_id,
        calendar_event_id,
        planned_at,
        favorited_at,
        is_favorite,
        activities (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((row) => ({
      ...row.activities,
      is_favorite: row.is_favorite,
      favorited_at: row.favorited_at,
      planned_at: row.planned_at,
      activity_date_id: row.activity_date_id,
      calendar_event_id: row.calendar_event_id,
    }));
  },

  async fetchFavorites(userId: string) {
    const { data, error } = await supabase
      .from("user_activities")
      .select("activity_id")
      .eq("user_id", userId)
      .eq("is_favorite", true);

    if (error) throw error;
    return data.map((r) => r.activity_id as string);
  },

  async addFavorite(userId: string, activityId: string) {
    const { error } = await supabase.from("user_activities").upsert(
      [
        {
          user_id: userId,
          activity_id: activityId,
          is_favorite: true,
        },
      ],
      {
        onConflict: "user_id,activity_id",
      }
    );
    if (error) throw error;
  },

  async removeFavorite(userId: string, activityId: string) {
    const { error } = await supabase
      .from("user_activities")
      .update({ is_favorite: false })
      .eq("user_id", userId)
      .eq("activity_id", activityId);
    if (error) throw error;
  },

  async toggleFavorite(
    userId: string,
    activityId: string,
    isFavorite: boolean
  ) {
    if (isFavorite) {
      await this.removeFavorite(userId, activityId);
    } else {
      await this.addFavorite(userId, activityId);
    }
  },

  async deleteActivity(userId: string, activityId: string) {
    const { error: linkError } = await supabase
      .from("user_activities")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);

    if (linkError) throw linkError;

    const { error: activityError } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId);

    if (activityError) throw activityError;
  },

  async cancelActivity(userId: string, activityId: string) {
    // Remove user linkage only; keep activity for other users.
    const { error: linkError } = await supabase
      .from("user_activities")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);
    if (linkError) throw linkError;
  },

  async setPlannedDate(
    userId: string,
    activityId: string,
    plannedAt: string | null,
    options?: { calendarEventId?: string | null }
  ) {
    const base: {
      planned_at: string | null;
      calendar_event_id?: string | null;
    } = {
      planned_at: plannedAt,
    };
    const hasCalendarEventId = options ? "calendarEventId" in options : false;
    if (hasCalendarEventId) {
      base.calendar_event_id = options?.calendarEventId ?? null;
    }

    // Try to update existing link (covers null activity_date_id rows)
    const { data: updated, error: updateError } = await supabase
      .from("user_activities")
      .update(base)
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .select("planned_at, activity_id, calendar_event_id, is_favorite")
      .maybeSingle();

    if (updateError) throw updateError;
    if (updated) return updated;

    // Fallback: insert if no existing row
    const { data: inserted, error: insertError } = await supabase
      .from("user_activities")
      .insert({
        user_id: userId,
        activity_id: activityId,
        planned_at: plannedAt,
        activity_date_id: null,
        ...(hasCalendarEventId
          ? { calendar_event_id: options?.calendarEventId ?? null }
          : {}),
      })
      .select("planned_at, activity_id, calendar_event_id, is_favorite")
      .single();

    if (insertError) throw insertError;
    return inserted;
  },

  async submitLocationSuggestion(params: {
    activityId: string;
    userId: string | null;
    place: PlaceDetails;
    note?: string | null;
  }) {
    const { activityId, userId, place, note } = params;
    const payload = {
      activity_id: activityId,
      user_id: userId,
      place_id: place.placeId,
      address: place.formattedAddress ?? place.name ?? "",
      latitude: place.latitude,
      longitude: place.longitude,
      note: note ?? null,
      status: "pending",
      source: "app",
    };

    const { error } = await supabase
      .from("location_suggestions")
      .insert(payload);

    if (error) throw error;

    await supabase
      .from("activities")
      .update({
        location_status: "suggested",
        needs_location_confirmation: true,
      })
      .eq("id", activityId);
  },

  async submitDateSuggestion(params: {
    activityId: string;
    userId: string | null;
    suggestedDate: Date;
    note?: string | null;
  }) {
    const { activityId, userId, suggestedDate, note } = params;
    const payload = {
      activity_id: activityId,
      user_id: userId,
      suggested_date: suggestedDate.toISOString(),
      note: note ?? null,
      status: "pending",
      source: "app",
    };

    const { error } = await supabase.from("date_suggestions").insert(payload);

    if (error) throw error;

    await supabase
      .from("activities")
      .update({
        needs_date_confirmation: true,
      })
      .eq("id", activityId);
  },

  async fetchActivityById(activityId: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .maybeSingle();
    if (error) throw error;
    return data as Activity | null;
  },
};
