import { supabase } from "@config/supabase";
import type { ShareIntent } from "expo-share-intent";
import type { Activity } from "@features/activites/utils/types";

interface AnalyzeArgs {
  shared: ShareIntent;
  userId: string;
}

export const importService = {
  analyze: async ({ shared, userId }: AnalyzeArgs): Promise<Activity> => {
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
