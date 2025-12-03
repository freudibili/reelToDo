import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "./deps.ts";
import { getSourceMetadata } from "./source.ts";
import { analyzeActivity } from "./ai.ts";
import { buildEnhancedDescription, extractMediaSignals } from "./media.ts";
import {
  mergeIfNull,
  normalizeActivity,
  normalizeCategory,
  inferCategoryFromContent,
  generateTitle,
  normalizeActivityUrl,
} from "./normalize.ts";
import { resolveDatesFromText, categoryNeedsDate } from "./datesResolver.ts";
import { fetchMediaAnalyzer, mapMediaAnalyzer } from "./mediaAnalyzer.ts";
import { shouldInvokeAI } from "./aiGate.ts";
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
  const userMeta = body.metadata as Record<string, any> | undefined;

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

  const normalizedUrl = normalizeActivityUrl(url);
  console.log("[fn] checking if activity already exists for", normalizedUrl);
  const { data: existing } = await supabase
    .from("activities")
    .select("*")
    .eq("source_url", normalizedUrl)
    .maybeSingle();

  if (existing) {
    console.log("[fn] already exists, returning existing id", existing.id);

    if (userId && !existing.user_id) {
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

    return new Response(JSON.stringify(existing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("[fn] fetching source meta for", url);
  const sourceMetaPromise = getSourceMetadata(url, userMeta);
  const analyzerPromise = fetchMediaAnalyzer(url);

  const sourceMeta = await sourceMetaPromise;
  console.log("[fn] sourceMeta", sourceMeta);

  const analyzerResult = await analyzerPromise;
  if (analyzerResult) {
    console.log(
      "[fn] mediaanalyzer platform",
      analyzerResult.platform ?? "unknown"
    );
    console.log("[fn] mediaanalyzer activity", {
      category: analyzerResult.activity?.category ?? null,
      title: analyzerResult.activity?.title ?? null,
      locations: analyzerResult.activity?.locations ?? null,
      dates: analyzerResult.activity?.dates ?? null,
      confidence: analyzerResult.activity?.confidence ?? null,
    });
  } else {
    console.log("[fn] mediaanalyzer unavailable");
  }
  const { activity: analyzerActivity, description: analyzerDescription } =
    mapMediaAnalyzer(analyzerResult, url);

  const shouldFetchMediaSignals =
    !analyzerResult &&
    !(
      analyzerActivity?.image_url ||
      analyzerResult?.thumbnailUrl ||
      sourceMeta.image
    );

  const mediaSignals = shouldFetchMediaSignals
    ? await extractMediaSignals(sourceMeta)
    : { transcript: null, imageSummary: null };
  console.log("[fn] mediaSignals", mediaSignals);

  const baseDescription =
    analyzerDescription ??
    sourceMeta.description ??
    analyzerResult?.rawDescription ??
    null;

  const enrichedDescription = buildEnhancedDescription(
    baseDescription,
    mediaSignals
  );

  const hasAnySourceMeta = Boolean(
    analyzerActivity?.title ||
    sourceMeta.title ||
    enrichedDescription ||
    analyzerActivity?.image_url ||
    analyzerResult?.thumbnailUrl ||
    sourceMeta.image ||
    sourceMeta.author ||
    analyzerResult?.rawDescription ||
    mediaSignals.transcript ||
    mediaSignals.imageSummary
  );
  if (!hasAnySourceMeta) {
    console.log("[fn] no usable metadata, aborting create");
    return new Response(
      JSON.stringify({
        error: "NO_CONTENT",
        reason: "Could not extract any metadata from the provided URL",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const shouldRunAI = shouldInvokeAI(analyzerActivity);

  const aiActivity = shouldRunAI
    ? await analyzeActivity({
        title:
          analyzerActivity?.title ??
          analyzerResult?.rawTitle ??
          sourceMeta.title ??
          null,
        description: enrichedDescription ?? baseDescription,
        image:
          analyzerActivity?.image_url ??
          analyzerResult?.thumbnailUrl ??
          sourceMeta.image ??
          null,
        author:
          analyzerActivity?.creator ??
          analyzerResult?.creator ??
          sourceMeta.author ??
          null,
        source_url:
          analyzerActivity?.source_url ?? analyzerResult?.sourceUrl ?? url,
      })
    : null;

  if (aiActivity) {
    console.log("[fn] aiActivity", aiActivity);
  } else {
    console.log("[fn] aiActivity skipped (analyzer confident)");
  }
  console.log("[fn] merge inputs", {
    analyzerCategory: analyzerActivity?.category ?? null,
    aiCategory: aiActivity?.category ?? null,
  });

  const emptyActivity = {
    title: null,
    category: null,
    location_name: null,
    address: null,
    city: null,
    country: null,
    latitude: null,
    longitude: null,
    date: null,
    tags: [],
    creator: null,
    image_url: null,
    confidence: null,
    source_url: null,
  };

  const mergedPrimary =
    analyzerActivity && aiActivity
      ? mergeIfNull(analyzerActivity, aiActivity) // prefer analyzer output, backfill with AI
      : (analyzerActivity ?? aiActivity ?? emptyActivity);

  let merged = mergeIfNull(mergedPrimary, {
    title: sourceMeta.title ?? analyzerResult?.rawTitle ?? null,
    creator:
      mergedPrimary.creator ??
      sourceMeta.author ??
      analyzerResult?.creator ??
      null,
    source_url: mergedPrimary.source_url ?? analyzerResult?.sourceUrl ?? url,
    image_url:
      mergedPrimary.image_url ??
      analyzerResult?.thumbnailUrl ??
      sourceMeta.image ??
      null,
  });

  const preferredTags =
    (analyzerActivity?.tags ?? []).length > 0
      ? (analyzerActivity?.tags ?? [])
      : (aiActivity?.tags ?? []);
  if (
    (!Array.isArray(merged.tags) || merged.tags.length === 0) &&
    preferredTags.length > 0
  ) {
    merged = { ...merged, tags: preferredTags };
  }

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

  let finalCategory = normalizeCategory(category);

  if (!finalCategory || finalCategory === "other") {
    const aiCategory = normalizeCategory(aiActivity?.category ?? null);
    if (aiCategory && aiCategory !== "other") {
      finalCategory = aiCategory;
    }
  }

  if (!finalCategory || finalCategory === "other") {
    const inferred = inferCategoryFromContent({
      title: title ?? sourceMeta.title ?? "",
      description: baseDescription ?? sourceMeta.description ?? "",
      location_name: location_name ?? "",
      tags,
    });
    if (inferred) finalCategory = inferred;
  }

  if (!finalCategory) {
    finalCategory = "other";
  }

  console.log("[fn] finalCategory", finalCategory);

  // Fallback date resolution: text parsing + OpenAI web search (only if missing dates for date-required categories)
  const needsDateResolution =
    categoryNeedsDate(finalCategory) &&
    (!Array.isArray(dates) || dates.length === 0);

  if (needsDateResolution) {
    const textForDates = [
      title ?? sourceMeta.title ?? "",
      baseDescription ?? sourceMeta.description ?? "",
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

  const finalTitle = generateTitle(
    finalCategory,
    location_name ?? sourceMeta.title ?? "Activity",
    city ?? null
  );
  console.log("[fn] finalTitle", finalTitle);

  const confidenceValue =
    typeof confidence === "number" || typeof aiActivity?.confidence === "number"
      ? Math.max(
          typeof confidence === "number" ? confidence : 0,
          typeof aiActivity?.confidence === "number" ? aiActivity.confidence : 0
        )
      : 0.9;

  const hasLocation = !!location_name || !!city || (!!latitude && !!longitude);

  const needsLocationConfirmation = !hasLocation || confidenceValue < 0.7;

  const needsDateConfirmation = categoryNeedsDate(finalCategory) && !mainDate;

  if (finalCategory === "other" || confidenceValue < 0.5) {
    console.log("[fn] rejected: unsuitable content", {
      category: finalCategory,
      confidence: confidenceValue,
    });
    return new Response(
      JSON.stringify({
        error: "UNSUITABLE_CONTENT",
        reason: "Content did not meet activity criteria (category/confidence).",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Secondary dedup: same date + city/location + overlapping title
  if (mainDate && (city || location_name)) {
    const titleFragment = (title ?? sourceMeta.title ?? "").slice(0, 80);
    const titlePattern = titleFragment ? `%${titleFragment}%` : null;

    let dupQuery = supabase
      .from("activities")
      .select("*")
      .contains("dates", [mainDate]);

    if (city) dupQuery = dupQuery.ilike("city", `%${city}%`);
    if (location_name)
      dupQuery = dupQuery.ilike("location_name", `%${location_name}%`);
    if (titlePattern) dupQuery = dupQuery.ilike("title", titlePattern);

    const { data: similar } = await dupQuery.limit(1).maybeSingle();

    if (similar) {
      console.log(
        "[fn] found potential duplicate by title/city/date",
        similar.id
      );

      if (userId) {
        console.log("[fn] upserting user_activities for duplicate activity");
        const { error: uaError } = await supabase
          .from("user_activities")
          .upsert(
            [
              {
                user_id: userId,
                activity_id: similar.id,
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

      return new Response(JSON.stringify(similar), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const insertPayload = {
    title: finalTitle,
    category: finalCategory,
    location_name: location_name ?? null,
    address: address ?? null,
    city: city ?? null,
    country: country ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    dates: Array.isArray(dates)
      ? dates.map((d: any) => d?.start).filter((d): d is string => Boolean(d))
      : [],
    tags: Array.isArray(tags) ? tags : [],
    creator: creator ?? sourceMeta.author ?? null,
    source_url: source_url ?? url,
    image_url: image_url ?? sourceMeta.image ?? null,
    confidence: typeof confidence === "number" ? confidence : 0.9,
    needs_location_confirmation: needsLocationConfirmation,
    needs_date_confirmation: needsDateConfirmation,
    user_id: userId ?? null,
    analyzer_locations:
      Array.isArray(analyzerResult?.activity?.locations) &&
      analyzerResult.activity.locations.length > 0
        ? analyzerResult.activity.locations
        : null,
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

  if (activity && analyzerResult) {
    const metaPayload = {
      activity_id: activity.id,
      platform: analyzerResult.platform ?? null,
      raw_title:
        analyzerResult.rawTitle ?? analyzerResult.activity?.title ?? null,
      raw_description: analyzerResult.rawDescription ?? null,
      thumbnail_url:
        analyzerResult.activity?.thumbnailUrl ??
        analyzerResult.thumbnailUrl ??
        null,
      key_info: analyzerResult.activity?.key_info ?? null,
      locations:
        Array.isArray(analyzerResult.activity?.locations) &&
        analyzerResult.activity.locations.length > 0
          ? analyzerResult.activity.locations
          : null,
      dates:
        Array.isArray(analyzerResult.activity?.dates) &&
        analyzerResult.activity.dates.length > 0
          ? analyzerResult.activity.dates
          : null,
    };

    const { error: metaError } = await supabase
      .from("activity_analyzer_metadata")
      .upsert([metaPayload], { onConflict: "activity_id" });

    if (metaError) {
      console.log("[fn] analyzer metadata upsert error", metaError);
    }
  }

  console.log("[fn] done", activity?.id);

  return new Response(JSON.stringify(activity), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
