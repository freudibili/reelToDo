import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "./deps.ts";
import { getSourceMetadata } from "./source.ts";
import { analyzeActivity } from "./ai.ts";
import {
  mergeIfNull,
  normalizeActivity,
  normalizeCategory,
  inferCategoryFromContent,
  generateTitle,
} from "./normalize.ts";
import { resolveDatesFromText, categoryNeedsDate } from "./datesResolver.ts";

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

  console.log("[fn] checking if activity already exists for", url);
  const { data: existing } = await supabase
    .from("activities")
    .select("*")
    .eq("source_url", url)
    .maybeSingle();

  if (existing) {
    console.log("[fn] already exists, returning existing id", existing.id);

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

    return new Response(JSON.stringify(existing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("[fn] fetching source meta for", url);
  const sourceMeta = await getSourceMetadata(url);
  console.log("[fn] sourceMeta", sourceMeta);

  const aiActivity = await analyzeActivity({
    title: sourceMeta.title ?? null,
    description: sourceMeta.description ?? null,
    image: sourceMeta.image ?? null,
    author: sourceMeta.author ?? null,
    source_url: url,
  });

  console.log("[fn] aiActivity", aiActivity);

  const merged = mergeIfNull(aiActivity, {
    title: sourceMeta.title ?? null,
    creator: sourceMeta.author ?? null,
    source_url: url,
    image_url: sourceMeta.image ?? null,
  });

  const normalized = normalizeActivity(merged);
  console.log("[fn] merged/normalized", normalized);

  let {
    title,
    category,
    location_name,
    address,
    city,
    country,
    latitude,
    longitude,
    dates,
    tags,
    creator,
    image_url,
    confidence,
    source_url,
  } = normalized;

  // Fallback date resolution: text parsing + OpenAI web search
  if (!Array.isArray(dates) || dates.length === 0) {
    const textForDates = [
      title ?? sourceMeta.title ?? "",
      sourceMeta.description ?? "",
      Array.isArray(tags) ? tags.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    const r = await resolveDatesFromText({
      text: textForDates,
      localeHint: "de",
      venue: location_name ?? null,
      city: city ?? null,
      artists: [creator].filter((x): x is string => Boolean(x)),
    });

    if (r && Array.isArray(r.dates) && r.dates.length > 0) {
      dates = r.dates.map((d: string) => ({
        start: d,
        end: null,
        recurrence_rule: null,
      }));
    }
  }

  const mainDate =
    Array.isArray(dates) && dates.length > 0 ? (dates[0].start ?? null) : null;

  let finalCategory = normalizeCategory(category);
  if (!finalCategory) {
    const inferred = inferCategoryFromContent({
      title: title ?? sourceMeta.title ?? "",
      description: sourceMeta.description ?? "",
      location_name: location_name ?? "",
      tags,
    });
    if (inferred) finalCategory = inferred;
  }

  console.log("[fn] finalCategory", finalCategory);

  if (!finalCategory) {
    console.log("[fn] unmapped category", category);
    return new Response(
      JSON.stringify({
        error: "UNMAPPED_CATEGORY",
        reason: "Could not map content to known categories",
        original_category: category,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const finalTitle = generateTitle(
    finalCategory,
    location_name ?? sourceMeta.title ?? "Activity",
    city ?? null
  );
  console.log("[fn] finalTitle", finalTitle);

  const needsLocationConfirmation =
    !location_name && !city && !latitude && !longitude;

  const needsDateConfirmation = categoryNeedsDate(finalCategory) && !mainDate;

  const insertPayload = {
    title: finalTitle,
    category: finalCategory,
    location_name: location_name ?? null,
    address: address ?? null,
    city: city ?? null,
    country: country ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    main_date: mainDate,
    tags: Array.isArray(tags) ? tags : [],
    creator: creator ?? sourceMeta.author ?? null,
    source_url: source_url ?? url,
    image_url: image_url ?? sourceMeta.image ?? null,
    confidence: typeof confidence === "number" ? confidence : 0.9,
    needs_location_confirmation: needsLocationConfirmation,
    needs_date_confirmation: needsDateConfirmation,
  };

  console.log("[fn] insertPayload", insertPayload);

  const { data: activity, error: insertError } = await supabase
    .from("activities")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertError) {
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

  if (activity && Array.isArray(dates) && dates.length > 0) {
    const rows = dates
      .filter((d: any) => d && d.start)
      .map((d: any) => ({
        activity_id: activity.id,
        start_date: d.start,
        end_date: d.end ?? null,
        recurrence_rule: d.recurrence_rule ?? null,
      }));
    if (rows.length > 0) {
      console.log("[fn] inserting activity_dates", rows.length);
      await supabase.from("activity_dates").insert(rows);
    }
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

  console.log("[fn] done", activity?.id);

  return new Response(JSON.stringify(activity), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
