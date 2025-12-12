import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../analyze-post/deps.ts";
import { getSourceMetadata } from "../analyze-post/source.ts";
import {
  categoriesRequiringDate,
  generateTitle,
  mergeIfNull,
  normalizeActivity,
  normalizeActivityUrl,
} from "../analyze-post/normalize.ts";
import { fetchMediaAnalyzer, mapMediaAnalyzer } from "../analyze-post/mediaAnalyzer.ts";
import { allowedCategories } from "../analyze-post/categories.ts";
import { sendActivityPush } from "../analyze-post/pushNotifications.ts";

type ProcessBody = {
  activityId?: string;
  activity_id?: string;
  url?: string;
  userId?: string;
  user_id?: string;
  platform?: string;
  extraSharedData?: Record<string, any>;
};

const deleteActivityCascade = async (activityId: string) => {
  await supabase.from("activity_dates").delete().eq("activity_id", activityId);
  await supabase.from("user_activities").delete().eq("activity_id", activityId);
  await supabase.from("activities").delete().eq("id", activityId);
};

const markFailed = async (
  activityId: string,
  message: string,
): Promise<any | null> => {
  try {
    await deleteActivityCascade(activityId);
    return { id: activityId, deleted: true, error: message };
  } catch (err) {
    console.log("[fn] delete on failure failed, falling back", err);
    const { data } = await supabase
      .from("activities")
      .update({
        processing_status: "failed",
        processing_step: null,
        processing_error: message,
      })
      .eq("id", activityId)
      .select("*")
      .maybeSingle();
    return data;
  }
};

serve(async (req) => {
  console.log("[fn] --- process-activity invoked ---");

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: ProcessBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const activityId = body.activityId ?? body.activity_id;
  if (!activityId) {
    return new Response(JSON.stringify({ error: "Missing activityId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .maybeSingle();

  if (fetchError || !activity) {
    console.log("[fn] missing activity", fetchError);
    return new Response(JSON.stringify({ error: "Activity not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = body.url ?? (activity as any).source_url ?? null;
  if (!url) {
    const failed = await markFailed(activityId, "Missing source url");
    return new Response(JSON.stringify(failed ?? { error: "Missing url" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedUrl = normalizeActivityUrl(url);
  const userId = body.userId ?? body.user_id ?? activity.user_id ?? null;
  const platform =
    body.platform ?? (activity as any).import_platform ?? null;
  const extraSharedData =
    body.extraSharedData ?? (activity as any).import_shared_data ?? null;

  await supabase
    .from("activities")
    .update({
      processing_status: "processing",
      processing_step: "analyzing",
      processing_error: null,
      source_url: normalizedUrl,
      import_platform: platform,
      import_shared_data: extraSharedData,
      user_id: userId ?? activity.user_id ?? null,
    })
    .eq("id", activityId);

  try {
    const userMeta = extraSharedData
      ? {
          title: extraSharedData.title ?? null,
          description: extraSharedData.text ?? null,
          thumbnail_url: extraSharedData.thumbnail_url ?? null,
          video_url: extraSharedData.video_url ?? null,
          author_name: extraSharedData.creator ?? null,
        }
      : undefined;

    const sourceMetaPromise = getSourceMetadata(url, userMeta);
    const analyzerPromise = fetchMediaAnalyzer(url, {
      platform: platform ?? null,
      extraSharedData: extraSharedData ?? null,
    });

    let analyzerFailed = false;
    let analyzerResult: any = null;

    try {
      analyzerResult = await analyzerPromise;
    } catch (err) {
      analyzerFailed = true;
      console.log("[fn] media analyzer call failed", err);
    }

    if (analyzerResult !== undefined) {
      console.log("[fn] mediaanalyzer raw result", analyzerResult);
    } else {
      console.log("[fn] mediaanalyzer returned undefined result");
    }

    if (analyzerResult && (analyzerResult as any)._errorReason) {
      analyzerFailed = true;
      console.log(
        "[fn] mediaanalyzer error",
        (analyzerResult as any)._errorReason,
      );
    }

    const sourceMeta = await sourceMetaPromise;
    const { activity: analyzerActivity, description: analyzerDescription } =
      await mapMediaAnalyzer(analyzerResult, url, {
        title: extraSharedData?.title,
        text: extraSharedData?.text,
        creator: extraSharedData?.creator,
        locationHint: extraSharedData?.locationHint,
        cityHint: extraSharedData?.cityHint,
        coordinates: extraSharedData?.coordinates,
        tags: extraSharedData?.tags,
      });

    const baseDescription =
      analyzerDescription ??
      sourceMeta.description ??
      analyzerResult?.rawDescription ??
      null;

    const hasAnySourceMeta = Boolean(
      analyzerActivity?.title ||
        sourceMeta.title ||
        baseDescription ||
        analyzerActivity?.image_url ||
        analyzerResult?.thumbnailUrl ||
        sourceMeta.image ||
        sourceMeta.author ||
        analyzerResult?.rawDescription,
    );

    if (!hasAnySourceMeta) {
      const failed = await markFailed(
        activityId,
        "Could not extract any metadata from the provided URL",
      );
      await sendActivityPush({
        userId,
        activityId,
        title: "Analysis failed",
        body: "We couldn't analyze your link.",
      });
      return new Response(JSON.stringify(failed), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    const mergedPrimary = analyzerActivity ? analyzerActivity : emptyActivity;

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

    const analyzerTags = Array.isArray(analyzerActivity?.tags)
      ? analyzerActivity!.tags
          .map((t: any) => String(t ?? "").trim())
          .filter(Boolean)
      : [];
    const hintTags = Array.isArray(extraSharedData?.tags)
      ? extraSharedData!.tags
          .map((t: any) => String(t ?? "").trim())
          .filter(Boolean)
      : [];
    const existingTags = Array.isArray(merged.tags)
      ? merged.tags.map((t: any) => String(t ?? "").trim()).filter(Boolean)
      : [];

    const finalTags =
      analyzerTags.length > 0
        ? Array.from(new Set([...analyzerTags, ...hintTags, ...existingTags]))
        : Array.from(new Set([...existingTags, ...hintTags]));
    merged = { ...merged, tags: finalTags };

    if (
      (merged.latitude == null || merged.longitude == null) &&
      extraSharedData?.coordinates
    ) {
      const lat = extraSharedData.coordinates.latitude;
      const lon = extraSharedData.coordinates.longitude;
      if (typeof lat === "number" && typeof lon === "number") {
        merged = { ...merged, latitude: lat, longitude: lon };
      }
    }

    const preferredTags =
      (analyzerActivity?.tags ?? []).length > 0
        ? (analyzerActivity?.tags ?? [])
        : [];
    if (
      (!Array.isArray(merged.tags) || merged.tags.length === 0) &&
      preferredTags.length > 0
    ) {
      merged = { ...merged, tags: preferredTags };
    }

    const normalized = normalizeActivity(merged);

    let {
      title: normalizedTitle,
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

    const finalCategory =
      category && allowedCategories.has(category) ? category : null;

    if (!finalCategory) {
      const failed = await markFailed(
        activityId,
        "Content category not supported",
      );
      await sendActivityPush({
        userId,
        activityId,
        title: "Analysis failed",
        body: "We couldn't recognize this link as an activity.",
      });
      return new Response(JSON.stringify(failed), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mainDate =
      Array.isArray(dates) && dates.length > 0
        ? (dates[0].start ?? null)
        : null;

    const finalTitle = generateTitle(
      finalCategory,
      location_name ?? sourceMeta.title ?? normalizedTitle ?? "Activity",
      city ?? null,
    );

    const confidenceValue = typeof confidence === "number" ? confidence : 0.9;

    const hasLocation =
      !!location_name || !!city || (!!latitude && !!longitude);

    const needsLocationConfirmation = !hasLocation || confidenceValue < 0.7;

    const needsDateConfirmation =
      categoriesRequiringDate.has(finalCategory) && !mainDate;

    if (confidenceValue < 0.5) {
      const failed = await markFailed(
        activityId,
        "Content did not meet activity criteria (category/confidence)",
      );
      await sendActivityPush({
        userId,
        activityId,
        title: "Analysis failed",
        body: "We couldn't map this content to an activity.",
      });
      return new Response(JSON.stringify(failed), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const analyzerLocations =
      Array.isArray(analyzerActivity?.locations) &&
      analyzerActivity.locations.length > 0
        ? analyzerActivity.locations
        : Array.isArray(analyzerResult?.activity?.locations) &&
            analyzerResult.activity.locations.length > 0
          ? analyzerResult.activity.locations
          : null;

    const updatePayload = {
      title: finalTitle,
      category: finalCategory,
      location_name: location_name ?? null,
      address: address ?? null,
      city: city ?? null,
      country: country ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      dates: Array.isArray(dates)
        ? dates
            .map((d: any) => d?.start)
            .filter((d): d is string => Boolean(d))
        : [],
      tags: Array.isArray(tags) ? tags : [],
      creator: creator ?? sourceMeta.author ?? null,
      source_url: source_url ?? normalizedUrl ?? url,
      image_url: image_url ?? sourceMeta.image ?? null,
      confidence: typeof confidence === "number" ? confidence : 0.9,
      needs_location_confirmation: needsLocationConfirmation,
      needs_date_confirmation: needsDateConfirmation,
      user_id: userId ?? activity.user_id ?? null,
      analyzer_locations: analyzerLocations,
      processing_status: "complete",
      processing_step: null,
      processing_error: null,
      import_platform: platform,
      import_shared_data: extraSharedData ?? null,
    } as const;

    const { data: updated, error: updateError } = await supabase
      .from("activities")
      .update(updatePayload)
      .eq("id", activityId)
      .select("*")
      .single();

    if (updateError) {
      console.log("[fn] updateError", updateError);
      const failed = await markFailed(activityId, updateError.message);
      await sendActivityPush({
        userId,
        activityId,
        title: "Analysis failed",
        body: "We couldn't finalize this activity.",
      });
      return new Response(JSON.stringify(failed), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabase.from("activity_dates").delete().eq("activity_id", activityId);
    if (updated && Array.isArray(dates) && dates.length > 0) {
      const rows = dates
        .filter((d: any) => d && d.start)
        .map((d: any) => ({
          activity_id: activityId,
          start_date: d.start,
          end_date: d.end ?? null,
          recurrence_rule: d.recurrence_rule ?? null,
        }));
      if (rows.length > 0) {
        await supabase.from("activity_dates").insert(rows);
      }
    }

    if (userId && activityId) {
      await supabase
        .from("user_activities")
        .upsert(
          [
            {
              user_id: userId,
              activity_id: activityId,
              is_favorite: false,
            },
          ],
          { onConflict: "user_id,activity_id" },
        );
    }

    await sendActivityPush({
      userId: updated?.user_id ?? userId,
      activityId,
      title: "Activity ready",
      body: updated?.title ?? "Your activity is ready",
      data: analyzerFailed ? { analyzerWarning: true } : undefined,
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("[fn] processing crashed", err);
    const message = err instanceof Error ? err.message : "Processing failed";
    const failed = await markFailed(activityId, message);
    await sendActivityPush({
      userId,
      activityId,
      title: "Analysis failed",
      body: message,
    });
    return new Response(JSON.stringify(failed ?? { error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
