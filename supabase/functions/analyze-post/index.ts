import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  supabase,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "./deps.ts";
import { normalizeActivityUrl } from "./normalize.ts";
import { detectSource, resolveTikTokUrl } from "./source.ts";

const triggerProcessActivity = (payload: Record<string, unknown>) => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.log("[fn] missing Supabase env for process-activity trigger");
    return;
  }

  try {
    fetch(`${supabaseUrl}/functions/v1/process-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify(payload),
    }).catch((err) =>
      console.log("[fn] process-activity trigger failed", err)
    );
  } catch (err) {
    console.log("[fn] process-activity trigger error", err);
  }
};

serve(async (req) => {
  console.log("[fn] --- analyze-post invoked ---");

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    console.log("[fn] invalid JSON body");
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = body.url as string | undefined;
  const userId = body.user_id as string | undefined;
  const platform = body.platform as string | undefined;
  const extraSharedData = body.extraSharedData as
    | Record<string, any>
    | undefined;
  const metadata = body.metadata as Record<string, any> | undefined;

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    new URL(url);
  } catch {
    console.log("[fn] invalid URL format", url);
    return new Response(
      JSON.stringify({
        error: "INVALID_URL",
        reason: "The provided url is not a valid URL",
        url,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const resolvedUrl = (await resolveTikTokUrl(url)) ?? url;
  const normalizedUrl = normalizeActivityUrl(resolvedUrl);
  console.log("[fn] checking if activity already exists for", normalizedUrl);
  const { data: existing } = await supabase
    .from("activities")
    .select("*")
    .eq("source_url", normalizedUrl)
    .maybeSingle();

  if (existing) {
    console.log("[fn] already exists, returning existing id", existing.id);

    const needsOwner = userId && !existing.user_id;
    if (needsOwner) {
      const { error: claimError } = await supabase
        .from("activities")
        .update({ user_id: userId })
        .eq("id", existing.id)
        .is("user_id", null);
      if (claimError) {
        console.log("[fn] ownership claim failed", claimError);
      } else {
        existing.user_id = userId;
      }
    }

    if (userId) {
      console.log("[fn] upserting user_activities for existing activity");
      const { error: uaError } = await supabase.from("user_activities").upsert(
        [
          {
            user_id: userId,
            activity_id: existing.id,
            is_favorite: false,
          },
        ],
        {
          onConflict: "user_id,activity_id",
        }
      );

      if (uaError) {
        console.log("[fn] user_activities upsert error", uaError);
      }
    }

    const isProcessing =
      (existing as any).processing_status === "processing" ||
      (existing as any).processing_status === "failed";

    if (isProcessing) {
      triggerProcessActivity({
        activityId: existing.id,
        url: normalizedUrl,
        userId,
        platform,
        extraSharedData,
      });
    }

    return new Response(JSON.stringify(existing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const placeholderTitle =
    extraSharedData?.title ?? metadata?.title ?? "Processing activity";
  const placeholderImage =
    extraSharedData?.thumbnail_url ?? metadata?.thumbnail_url ?? null;
  const placeholderCreator =
    extraSharedData?.creator ?? metadata?.author_name ?? null;
  const placeholderSource = detectSource(normalizedUrl);
  const tags = Array.isArray(extraSharedData?.tags)
    ? extraSharedData!.tags.filter((t: unknown) => typeof t === "string")
    : [];

  const insertPayload = {
    title: placeholderTitle,
    category: null,
    location_name: null,
    address: null,
    city: null,
    country: null,
    latitude: null,
    longitude: null,
    dates: [],
    tags,
    creator: placeholderCreator,
    source_url: normalizedUrl,
    image_url: placeholderImage,
    confidence: null,
    source: placeholderSource,
    needs_location_confirmation: false,
    needs_date_confirmation: false,
    user_id: userId ?? null,
    processing_status: "processing",
    processing_step: "queued",
    processing_error: null,
    import_platform: platform ?? null,
    import_shared_data: extraSharedData ?? null,
  } as const;

  const { data: activity, error: insertError } = await supabase
    .from("activities")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      console.log(
        "[fn] duplicate source_url on insert, fetching existing",
        normalizedUrl
      );
      const { data: existingDup } = await supabase
        .from("activities")
        .select("*")
        .eq("source_url", normalizedUrl)
        .maybeSingle();

      if (existingDup) {
        if (userId) {
          console.log("[fn] upserting user_activities after duplicate insert");
          await supabase.from("user_activities").upsert(
            [
              {
                user_id: userId,
                activity_id: existingDup.id,
                is_favorite: false,
              },
            ],
            { onConflict: "user_id,activity_id" }
          );
        }

        return new Response(JSON.stringify(existingDup), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    console.log("[fn] insertError", insertError);
    return new Response(
      JSON.stringify({
        error: insertError.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (userId && activity?.id) {
    console.log("[fn] upserting user_activities for new activity");
    const { error: uaError } = await supabase.from("user_activities").upsert(
      [
        {
          user_id: userId,
          activity_id: activity.id,
          is_favorite: false,
        },
      ],
      {
        onConflict: "user_id,activity_id",
      }
    );

    if (uaError) {
      console.log("[fn] user_activities upsert error", uaError);
    }
  }

  if (activity?.id) {
    triggerProcessActivity({
      activityId: activity.id,
      url: normalizedUrl,
      userId,
      platform,
      extraSharedData,
    });
  }

  return new Response(JSON.stringify(activity), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
