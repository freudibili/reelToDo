import { ALLOWED_CATEGORIES, normalizeCategory } from "./normalize.ts";

type CategoryInput = {
  title?: string | null;
  description?: string | null;
  tags?: string[];
  location_name?: string | null;
};

export const classifyCategory = async (
  input: CategoryInput
): Promise<string | null> => {
  const mockResponse = (globalThis as any).__aiCategoryMockResponse;
  if (mockResponse) {
    const normalizedMock = normalizeCategory(mockResponse);
    return normalizedMock ?? "other";
  }
  try {
    const { openai: realOpenAI } = await import("./deps.ts");
    // allow test override
    const openai: typeof realOpenAI | undefined =
      (globalThis as any).__openaiMock ?? realOpenAI;
    if (!openai?.chat?.completions?.create) {
      console.log("[aiCategory] openai client unavailable");
      return null;
    }
    const allowed = ALLOWED_CATEGORIES.join(", ");
    const messages = [
      {
        role: "system" as const,
        content: `
Return ONLY a JSON object: {"category": "<slug from list>"}
Allowed slugs: ${allowed}

Map phrases to slugs:
- hike/trail/walk -> outdoor-hike
- view/viewpoint/panorama -> outdoor-viewpoint
- nature/outdoor/travel/sunrise -> outdoor-nature-spot
- beach -> outdoor-beach
- park -> outdoor-park
- cafe/coffee -> food-cafe
- restaurant/food/lunch/dinner -> food-restaurant
- bar/cocktail -> food-bar
- street food/food truck -> food-street-food
- market -> event-market
- festival/fest -> event-festival
- concert/live music -> event-concert
- exhibition/expo -> event-exhibition
- museum -> culture-museum
- monument/castle -> culture-monument
- architecture/landmark -> culture-architecture
- workshop + cook -> workshop-cooking
- workshop + art/atelier -> workshop-art
- workshop + yoga/spa/retreat -> workshop-wellness
- club -> nightlife-club
- nightlife/bar/late bar -> nightlife-bar
- shop/local -> shopping-local
- vintage -> shopping-vintage

Choose the single best slug. If unclear, return "other".
        `,
      },
      {
        role: "user" as const,
        content: `
Title: ${input.title ?? ""}
Description: ${input.description ?? ""}
Tags: ${(input.tags ?? []).join(", ")}
Location: ${input.location_name ?? ""}
        `,
      },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages,
    });

    const raw = res.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { category?: string };
    const normalized = normalizeCategory(parsed.category ?? null);
    return normalized ?? "other";
  } catch (err) {
    console.log("[aiCategory] classification error", err);
    return null;
  }
};
