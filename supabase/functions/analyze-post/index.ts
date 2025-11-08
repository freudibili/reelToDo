// supabase/functions/analyze-post/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import OpenAI from "https://esm.sh/openai@4.67.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  throw new Error("Missing environment variables for Supabase or OpenAI");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const detectSource = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com")) return "facebook";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  return "generic";
};

const decodeHtml = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const extractMetaFromHtml = (html: string) => {
  const get = (regex: RegExp) => {
    const m = html.match(regex);
    return m?.[1] ?? null;
  };
  const title =
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  const description =
    get(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    ) ||
    get(
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i
    );
  const image =
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  return { title, description, image };
};

const tryFetchMetadata = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return { title: null, description: null, image: null };
    const html = await res.text();
    return extractMetaFromHtml(html);
  } catch (_e) {
    return { title: null, description: null, image: null };
  }
};

const mergeIfNull = (original: any, enriched: any) => {
  const clone = { ...original };
  for (const key of Object.keys(enriched)) {
    if (
      (clone[key] === null || typeof clone[key] === "undefined") &&
      enriched[key] !== null &&
      typeof enriched[key] !== "undefined"
    ) {
      clone[key] = enriched[key];
    }
  }
  return clone;
};

const normalizeActivity = (payload: any) => {
  const safe = payload || {};
  const dates = Array.isArray(safe.dates) ? safe.dates : [];
  const tags = Array.isArray(safe.tags) ? safe.tags : [];
  return {
    ...safe,
    dates,
    tags,
  };
};

// ====== NOUVELLES PARTIES ======

// liste fermée pour tes cards
const ALLOWED_CATEGORIES = [
  "outdoor-hike",
  "outdoor-nature-spot",
  "food-cafe",
  "food-restaurant",
  "drink-bar",
  "culture-spot",
  "fun-activity",
  "shop-local",
  "accommodation",
  "event-market",
  "event-festival",
  "event-workshop",
  "event-show",
  "event-other",
] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

// mappe ce que l'IA renvoie vers ta liste
const normalizeCategory = (
  raw: string | null | undefined
): AllowedCategory | null => {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();

  const map: Record<string, AllowedCategory> = {
    // ancien prompt
    hike: "outdoor-hike",
    randonnée: "outdoor-hike",
    rando: "outdoor-hike",
    waterfall: "outdoor-nature-spot",
    cascade: "outdoor-nature-spot",
    nature: "outdoor-nature-spot",
    cafe: "food-cafe",
    coffee: "food-cafe",
    restaurant: "food-restaurant",
    market: "event-market",
    event: "event-other",
    workshop: "event-workshop",
    museum: "culture-spot",
    kids: "fun-activity",
    sports: "fun-activity",
  };

  if (map[v]) return map[v];

  const direct = ALLOWED_CATEGORIES.find((c) => c === v);
  if (direct) return direct;

  return null;
};

// si l'IA met category=null mais qu'on voit "cascade", on force
const inferCategoryFromContent = (opts: {
  title?: string | null;
  description?: string | null;
  location_name?: string | null;
  tags?: string[] | null;
}): AllowedCategory | null => {
  const haystack = [
    opts.title ?? "",
    opts.description ?? "",
    opts.location_name ?? "",
    ...(opts.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (
    haystack.includes("cascade") ||
    haystack.includes("cascades") ||
    haystack.includes("vallée") ||
    haystack.includes("vallee") ||
    haystack.includes("takamaka") ||
    haystack.includes("réunion") ||
    haystack.includes("reunion")
  ) {
    return "outdoor-nature-spot";
  }

  return null;
};

const generateTitle = (
  category: AllowedCategory,
  locationName: string | null,
  city: string | null
): string => {
  const emojiMap: Record<AllowedCategory, string> = {
    "outdoor-hike": "🥾",
    "outdoor-nature-spot": "🏞️",
    "food-cafe": "☕",
    "food-restaurant": "🍽️",
    "drink-bar": "🍹",
    "culture-spot": "🏛️",
    "fun-activity": "🎡",
    "shop-local": "🛍️",
    accommodation: "🛏️",
    "event-market": "🎄",
    "event-festival": "🎉",
    "event-workshop": "🎨",
    "event-show": "🎟️",
    "event-other": "🗓️",
  };

  const emoji = emojiMap[category] ?? "📍";
  if (!locationName && !city) return `${emoji} Activité à découvrir`;
  if (!locationName) return `${emoji} À faire à ${city}`;
  if (!city) return `${emoji} ${locationName}`;
  return `${emoji} ${locationName} – ${city}`;
};

// ====== HANDLER ======
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { url, userId, metadata } = body;

  if (!url) {
    return new Response(JSON.stringify({ error: "url is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const source = detectSource(url);
  const fetchedMeta = await tryFetchMetadata(url);

  const finalTitleFromMeta = metadata?.title ?? fetchedMeta.title ?? null;
  const finalDescriptionFromMeta =
    metadata?.description ?? fetchedMeta.description ?? null;
  const finalAuthor = metadata?.author_name ?? null;
  const finalImage = metadata?.thumbnail_url ?? fetchedMeta.image ?? null;

  const textParts: string[] = [];
  textParts.push(`Source URL: ${url}`);
  textParts.push(`Source type: ${source}`);
  if (finalTitleFromMeta) textParts.push(`Title: ${finalTitleFromMeta}`);
  if (finalDescriptionFromMeta)
    textParts.push(`Description: ${finalDescriptionFromMeta}`);
  if (finalAuthor) textParts.push(`Author: ${finalAuthor}`);

  const basePrompt = `
You are given information about a short social media post that describes a real-life activity or event.
Return a JSON object with the following shape:

{
  "title": string,
  "category": string | null,
  "location_name": string | null,
  "address": string | null,
  "city": string | null,
  "latitude": number | null,
  "longitude": number | null,
  "dates": [
    {
      "start": string,
      "end": string | null,
      "recurrence_rule": string | null
    }
  ],
  "tags": string[],
  "creator": string | null,
  "image_url": string | null,
  "confidence": number,
  "source_url": string
}

Rules:
- If the post is about a single event with one date, put exactly one item in "dates".
- If the post mentions recurring schedule, add one item with an RRULE in "recurrence_rule".
- If no date is given, return "dates": [].
- If location is not explicit, set location fields to null.
- "category" can be: "hike", "cafe", "restaurant", "market", "event", "workshop", "kids", "museum", "sports", or null.
- "source_url" must be the original URL provided.

Content to analyze:
${textParts.join("\n")}
`.trim();

  let parsed: any = {};
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only valid JSON." },
        { role: "user", content: basePrompt },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";

    console.log("[analyze-post] ✅ OpenAI base completion raw:", raw);

    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("[analyze-post] ❌ Error during base completion:", e);
    return new Response(
      JSON.stringify({ error: "OpenAI generation failed", details: `${e}` }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const needsEnrich =
    (!parsed.location_name && finalTitleFromMeta) ||
    (!parsed.city && finalTitleFromMeta) ||
    (!parsed.latitude && finalTitleFromMeta);

  let enriched: any = {};
  if (needsEnrich) {
    const enrichPrompt = `
You are enriching place and time information for an already parsed activity.
Use your world knowledge. Only fill fields you are reasonably sure about.
Return exactly this JSON shape:

{
  "location_name": string | null,
  "address": string | null,
  "city": string | null,
  "latitude": number | null,
  "longitude": number | null,
  "dates": [
    {
      "start": string,
      "end": string | null,
      "recurrence_rule": string | null
    }
  ]
}

Activity context:
- title: ${parsed.title ?? finalTitleFromMeta ?? ""}
- description: ${finalDescriptionFromMeta ?? ""}
- source_url: ${url}
- creator: ${parsed.creator ?? finalAuthor ?? ""}
`.trim();

    try {
      const enrichCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You output only valid JSON." },
          { role: "user", content: enrichPrompt },
        ],
      });

      const raw2 = enrichCompletion.choices[0].message.content || "{}";

      console.log("[analyze-post] 🌍 OpenAI enrich completion raw:", raw2);

      enriched = JSON.parse(raw2);
    } catch (_e) {
      console.error("[analyze-post] ⚠️ Error during enrich completion:", _e);
      enriched = {};
    }
  }

  const mergedLocation = mergeIfNull(parsed, enriched);
  const normalized = normalizeActivity(mergedLocation);

  const {
    title,
    category,
    location_name,
    address,
    city,
    latitude,
    longitude,
    dates,
    tags,
    creator,
    image_url,
    confidence,
    source_url,
  } = normalized;

  const mainDate =
    Array.isArray(dates) && dates.length > 0 ? (dates[0].start ?? null) : null;

  const normalizedSourceUrl = decodeHtml(source_url ?? url);
  const normalizedImageUrl = decodeHtml(image_url ?? finalImage ?? null);

  // ====== nouvelle logique de catégorie ======
  let finalCategory = normalizeCategory(category);
  if (!finalCategory) {
    const inferred = inferCategoryFromContent({
      title: title ?? finalTitleFromMeta ?? "",
      description: finalDescriptionFromMeta ?? "",
      location_name: location_name ?? "",
      tags,
    });
    if (inferred) {
      finalCategory = inferred;
    }
  }

  if (!finalCategory) {
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

  // titre final propre
  const finalTitle = generateTitle(
    finalCategory,
    location_name ?? null,
    city ?? null
  );

  const insertPayload = {
    user_id: userId ?? null,
    title: finalTitle,
    category: finalCategory,
    location_name: location_name ?? null,
    address: address ?? null,
    city: city ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    main_date: mainDate,
    tags: Array.isArray(tags) ? tags : [],
    creator: creator ?? finalAuthor ?? null,
    source_url: normalizedSourceUrl ?? url,
    image_url: normalizedImageUrl,
    confidence: typeof confidence === "number" ? confidence : 0.9,
  };

  const { data: activity, error: insertError } = await supabase
    .from("activities")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertError) {
    return new Response(
      JSON.stringify({
        error: insertError.message,
        payload: insertPayload,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (Array.isArray(dates) && dates.length > 0) {
    const rows = dates
      .filter((d: any) => d && d.start)
      .map((d: any) => ({
        activity_id: activity.id,
        start_date: d.start,
        end_date: d.end ?? null,
        recurrence_rule: d.recurrence_rule ?? null,
      }));
    if (rows.length > 0) {
      await supabase.from("activity_dates").insert(rows);
    }
  }

  return new Response(JSON.stringify(activity), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
