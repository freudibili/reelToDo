// supabase/functions/analyze-post/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import OpenAI from "https://esm.sh/openai@4.67.2";

// 🔐 Chargement des variables d'environnement (Supabase uniquement)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  throw new Error("Missing environment variables for Supabase or OpenAI");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { url, userId, metadata } = await req.json();

  if (!url || !userId) {
    return new Response(
      JSON.stringify({ error: "url and userId are required" }),
      { status: 400 }
    );
  }

  const textParts: string[] = [];
  textParts.push(`Source URL: ${url}`);
  if (metadata?.title) textParts.push(`Title: ${metadata.title}`);
  if (metadata?.description)
    textParts.push(`Description: ${metadata.description}`);
  if (metadata?.author_name) textParts.push(`Author: ${metadata.author_name}`);

  const prompt = `
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
      "start": string,    // ISO 8601
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
- If the post mentions recurring schedule (every saturday, chaque dimanche, tous les jeudis...), add one item with an RRULE in "recurrence_rule".
- If no date is given, return "dates": [].
- If location is not explicit, set location fields to null.
- "category" can be: "hike", "cafe", "restaurant", "market", "event", "workshop", "kids", "museum", "sports", or null.
- "source_url" must be the original URL provided.

Content to analyze:
${textParts.join("\n")}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You output only valid JSON." },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0].message.content || "{}";
  const parsed = JSON.parse(raw);

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
  } = parsed;

  const mainDate =
    Array.isArray(dates) && dates.length > 0 ? (dates[0].start ?? null) : null;

  const { data: activity, error: insertError } = await supabase
    .from("activities")
    .insert({
      user_id: userId,
      title: title ?? "Activité",
      category: category ?? null,
      location_name: location_name ?? null,
      address: address ?? null,
      city: city ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      main_date: mainDate,
      tags,
      creator: creator ?? metadata?.author_name ?? null,
      source_url: source_url ?? url,
      image_url: image_url ?? metadata?.thumbnail_url ?? null,
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
