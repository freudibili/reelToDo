import OpenAI from "https://esm.sh/openai@4.67.2";
import {
  ALLOWED_CATEGORIES,
  normalizeCategory,
  inferCategoryFromContent,
} from "./normalize.ts";
import { geocodePlace } from "./googlePlaces.ts";

const cleanTitle = (raw: string | null): string | null => {
  if (!raw) return null;
  // strip basic emojis (ranges) + hashtags + extra spaces
  const noEmoji = raw
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "");
  const noHash = noEmoji.replace(/#\w+/g, "");
  const collapsed = noHash.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : null;
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

type AnalyzeInput = {
  title: string | null;
  description: string | null;
  image: string | null;
  author: string | null;
  source_url: string;
};

type AnalyzeOutput = {
  title: string | null;
  category: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  tags: string[];
  creator: string | null;
  source_url: string;
  image_url: string | null;
  confidence: number;
};

const safeLower = (v: string | null | undefined) =>
  typeof v === "string" ? v.toLowerCase() : "";

const guessCountryFromText = (text: string | null): string | null => {
  const hay = safeLower(text);

  if (
    hay.includes("switzerland") ||
    hay.includes("suisse") ||
    hay.includes("schweiz")
  ) {
    return "Switzerland";
  }
  if (
    hay.includes("france") ||
    hay.includes("français") ||
    hay.includes("francaise") ||
    hay.includes("française")
  ) {
    return "France";
  }
  if (
    hay.includes("italy") ||
    hay.includes("italie") ||
    hay.includes("italien")
  ) {
    return "Italy";
  }
  if (
    hay.includes("germany") ||
    hay.includes("allemagne") ||
    hay.includes("deutschland")
  ) {
    return "Germany";
  }
  if (
    hay.includes("norway") ||
    hay.includes("norvège") ||
    hay.includes("norge")
  ) {
    return "Norway";
  }
  if (
    hay.includes("austria") ||
    hay.includes("autriche") ||
    hay.includes("österreich")
  ) {
    return "Austria";
  }
  return null;
};

export const analyzeActivity = async (
  meta: AnalyzeInput
): Promise<AnalyzeOutput> => {
  const allowed = ALLOWED_CATEGORIES.join(", ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are an extraction engine specialized in identifying real-world activities from social media posts.

Extract the following fields and return ONLY a valid JSON object:
- title
- category
- location_name
- address
- city
- country
- latitude
- longitude
- date
- tags
- creator
- source_url
- confidence
- image_url

### CATEGORY RULES
The "category" MUST be exactly one of:
${allowed}

Choose the **single best** category. Never invent new ones.

### TITLE FORMAT
Title must be:
"<Category label>: <Name> (<City>)"
If city is unknown, omit "(<City>)".
Never include emojis or hashtags.

### MAIN ACTIVITY SELECTION
If the post mentions multiple places or events:
- Select **only the main one** (the primary topic of the post).
- Prefer the one with the strongest emphasis, call to action, details, or the first highlighted element.

### LOCATION VALIDATION
Determine whether the place/event/restaurant/hike appears to be real:
- Use name, city hints, hashtags, metadata, known places.
- If confident, return detailed address + coordinates.
- If unsure, return null for unclear fields and lower the confidence.
- Never invent precise addresses or GPS coordinates.

### DATE VALIDATION (CRITICAL)
If the category is an event or workshop:
- Extract a real calendar date if the post mentions one.
- Use explicit dates OR relative dates ("this Saturday") based on post publication date.
- Output format: "YYYY-MM-DD"
- If the date is unclear or missing, set date = null and lower confidence.

For non-event categories (restaurants, hikes, views, museums, landmarks), date = null.

### TAGS
Return a short array of relevant keywords ("concert","music","zurich","nature","hike",...).

### CONFIDENCE
Return a number between 0 and 1.
Lower confidence when:
- location uncertain
- date uncertain
- ambiguous post

### STRICTNESS
- Never hallucinate places or dates.
- Use null for unknown or uncertain fields.
- Return ONLY the JSON object.
        `,
      },

      {
        role: "user",
        content: `
Return a JSON object with the keys:
title, category, location_name, address, city, country,
latitude, longitude, date, tags, creator, source_url, confidence, image_url.

The category MUST be one of: ${allowed}.
        `,
      },

      {
        role: "user",
        content: `
Post metadata:
Title: ${meta.title}
Description: ${meta.description}
Author: ${meta.author}
Image: ${meta.image}
URL: ${meta.source_url}


Respond strictly in JSON format only.
        `,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AnalyzeOutput>;

  const aiCategory = normalizeCategory(parsed.category ?? null);
  const fallbackCategory =
    aiCategory ??
    inferCategoryFromContent({
      title: meta.title,
      description: meta.description,
      tags: parsed.tags ?? [],
      location_name: parsed.location_name ?? null,
    }) ??
    "other";

  // minimal: compute a fallback date from plain text if model didn't give one

  let resolvedDateFromText: string | null = null;
  try {
    const textForDates = [
      meta.title ?? "",
      meta.description ?? "",
      Array.isArray(parsed.tags) ? parsed.tags.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    const dateInfo = await resolveDatesFromText({
      text: textForDates,
      localeHint: "en",
      venue: parsed.location_name ?? null,
      city: parsed.city ?? null,
      artists: [parsed.creator, meta.author].filter((x): x is string =>
        Boolean(x)
      ),
    });

    if (dateInfo?.main_date) {
      resolvedDateFromText = dateInfo.main_date;
    }
  } catch {}

  const resolvedLocation = (await geocodePlace(
    parsed.location_name ?? parsed.address ?? meta.title ?? ""
  )) ?? {
    location_name: parsed.location_name ?? null,
    address: parsed.address ?? null,
    city: parsed.city ?? null,
    country: null,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
  };

  return {
    title: cleanTitle(parsed.title ?? meta.title ?? null),
    category: fallbackCategory,
    location_name: resolvedLocation.location_name,
    address: parsed.address ?? resolvedLocation.address ?? null,
    city: parsed.city ?? resolvedLocation.city ?? null,
    country:
      parsed.country ??
      resolvedLocation.country ??
      guessCountryFromText(meta.title ?? "") ??
      guessCountryFromText(meta.description ?? "") ??
      null,
    latitude: resolvedLocation.latitude,
    longitude: resolvedLocation.longitude,
    date: parsed.date ?? resolvedDateFromText ?? null,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    creator: parsed.creator ?? meta.author ?? null,
    source_url: parsed.source_url ?? meta.source_url,
    image_url: parsed.image_url ?? meta.image ?? null,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
  };
};
