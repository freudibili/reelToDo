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
    hay.includes("norwegen")
  ) {
    return "Norway";
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
        content:
          "You extract structured activity data from social media posts. Choose the best category from the provided list.",
      },
      {
        role: "user",
        content:
          `Return JSON with keys: title, category, location_name, address, city, latitude, longitude, date, tags, creator, source_url, confidence, image_url.` +
          ` The category MUST be one of: ${allowed}. Title must be human friendly (no emojis, no hashtags).`,
      },
      {
        role: "user",
        content: `Post metadata:\nTitle: ${meta.title}\nDescription: ${meta.description}\nAuthor: ${meta.author}\nImage: ${meta.image}\nURL: ${meta.source_url}`,
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

  // try to geocode if AI gave a place name or address
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
    address: resolvedLocation.address,
    city: resolvedLocation.city,
    country:
      parsed.country ??
      resolvedLocation.country ??
      guessCountryFromText(meta.title ?? "") ??
      guessCountryFromText(meta.description ?? "") ??
      null,
    latitude: resolvedLocation.latitude,
    longitude: resolvedLocation.longitude,
    date: parsed.date ?? null,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    creator: parsed.creator ?? meta.author ?? null,
    source_url: parsed.source_url ?? meta.source_url,
    image_url: parsed.image_url ?? meta.image ?? null,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
  };
};
