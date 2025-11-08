import OpenAI from "https://esm.sh/openai@4.67.2";
import {
  ALLOWED_CATEGORIES,
  normalizeCategory,
  inferCategoryFromContent,
} from "./normalize.ts";
import { geocodePlace } from "./googlePlaces.ts";

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
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  tags: string[];
  creator: string | null;
  source_url: string;
  image_url: string | null;
  confidence: number;
};

const buildUserContent = (meta: AnalyzeInput) =>
  [meta.title ?? "", meta.description ?? "", meta.source_url].join("\n");

const emptyToNull = (v: any) => (v === "" || v === undefined ? null : v);

const extractLocationContext = (textParts: (string | null | undefined)[]) => {
  const hay = textParts.filter(Boolean).join(" ").toLowerCase();

  if (
    hay.includes("austria") ||
    hay.includes("autriche") ||
    hay.includes("österreich")
  ) {
    return "Austria";
  }
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
        content: `Allowed categories: ${allowed}`,
      },
      {
        role: "user",
        content: buildUserContent(meta),
      },
      {
        role: "user",
        content:
          "Return JSON with keys: title, category, location_name, address, city, latitude, longitude, date, tags, creator, source_url, confidence, image_url.",
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
    });

  const locationName = emptyToNull(parsed.location_name);
  const city = emptyToNull(parsed.city);

  const context = extractLocationContext([
    parsed.title,
    parsed.address,
    parsed.city,
    meta.title,
    meta.description,
  ]);

  let resolvedLocation = {
    location_name: locationName,
    address: emptyToNull(parsed.address),
    city,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
  };

  if (
    locationName &&
    (!resolvedLocation.latitude || !resolvedLocation.longitude)
  ) {
    const geo = await geocodePlace(String(locationName), context);
    if (geo) {
      resolvedLocation = {
        location_name: geo.location_name ?? locationName,
        address: geo.address ?? resolvedLocation.address,
        city: geo.city ?? resolvedLocation.city,
        latitude: geo.latitude ?? resolvedLocation.latitude,
        longitude: geo.longitude ?? resolvedLocation.longitude,
      };
    }
  }

  return {
    title: parsed.title ?? meta.title ?? null,
    category: fallbackCategory,
    location_name: resolvedLocation.location_name,
    address: resolvedLocation.address,
    city: resolvedLocation.city,
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
