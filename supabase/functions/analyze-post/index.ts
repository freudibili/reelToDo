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
    });
  }

  const { url, userId, metadata } = body;

  if (!url || !userId) {
    return new Response(
      JSON.stringify({ error: "url and userId are required" }),
      {
        status: 400,
      }
    );
  }

  const source = detectSource(url);
  const fetchedMeta = await tryFetchMetadata(url);

  const finalTitle = metadata?.title ?? fetchedMeta.title ?? null;
  const finalDescription =
    metadata?.description ?? fetchedMeta.description ?? null;
  const finalAuthor = metadata?.author_name ?? null;
  const finalImage = metadata?.thumbnail_url ?? fetchedMeta.image ?? null;

  const textParts: string[] = [];
  textParts.push(`Source URL: ${url}`);
  textParts.push(`Source type: ${source}`);
  if (finalTitle) textParts.push(`Title: ${finalTitle}`);
  if (finalDescription) textParts.push(`Description: ${finalDescription}`);
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

  let parsed: any;
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
    parsed = JSON.parse(raw);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "OpenAI generation failed", details: `${e}` }),
      {
        status: 500,
      }
    );
  }

  const needsEnrich =
    (!parsed.location_name && finalTitle) ||
    (!parsed.city && finalTitle) ||
    (!parsed.latitude && finalTitle);

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
- title: ${parsed.title ?? finalTitle ?? ""}
- description: ${finalDescription ?? ""}
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
      enriched = JSON.parse(raw2);
    } catch (_e) {
      enriched = {};
    }
  }

  const mergedLocation = mergeIfNull(parsed, enriched);

  const {
    title,
    category,
    location_name,
    address,
    city,
    latitude,
    longitude,
    dates = [],
    tags = [],
    creator,
    image_url,
    confidence,
    source_url,
  } = mergedLocation;

  const mainDate =
    Array.isArray(dates) && dates.length > 0 ? (dates[0].start ?? null) : null;

  const { data: activity, error: insertError } = await supabase
    .from("activities")
    .insert({
      user_id: userId,
      title: title ?? finalTitle ?? "Activité",
      category: category ?? null,
      location_name: location_name ?? null,
      address: address ?? null,
      city: city ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      main_date: mainDate,
      tags,
      creator: creator ?? finalAuthor ?? null,
      source_url: source_url ?? url,
      image_url: image_url ?? finalImage ?? null,
      confidence: confidence ?? null,
    })
    .select("*")
    .single();

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
    });
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
    headers: { "Content-Type": "application/json" },
  });
});
