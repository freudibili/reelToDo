import { supabase } from "@config/supabase";

export const ActivitiesService = {
  async fetchActivities(userId?: string | null) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("user_activities")
      .select(
        `
        activity_id,
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
    // Claim ownership if not yet set
    await supabase
      .from("activities")
      .update({ user_id: userId })
      .eq("id", activityId)
      .is("user_id", null);

    // Remove user linkage
    const { error: linkError } = await supabase
      .from("user_activities")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);
    if (linkError) throw linkError;

    // Remove the activity, but only if the user owns it
    const { error: activityError, count } = await supabase
      .from("activities")
      .delete({ count: "exact" })
      .eq("id", activityId)
      .eq("user_id", userId);
    if (activityError) throw activityError;
    // If nothing deleted, surface explicit error for caller
    if (!count) {
      throw new Error("Activity not owned by user or already deleted");
    }
  },
};
