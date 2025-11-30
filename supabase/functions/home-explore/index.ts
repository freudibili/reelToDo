import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { openai } from "../analyze-post/deps.ts";

type BudgetLevel = 1 | 2 | 3;
type CategoryTag =
  | "highlights"
  | "walks"
  | "hikes"
  | "museums"
  | "food"
  | "cafes"
  | "bars"
  | "markets"
  | "nightlife"
  | "family"
  | "design";

type Itinerary = {
  id: string;
  title: string;
  description: string;
  days: number;
  stops: string[];
  tags: CategoryTag[];
};

type EatSpot = {
  id: string;
  name: string;
  category: string;
  budget: BudgetLevel;
  description: string;
  distance: string;
  tags: CategoryTag[];
};

type SleepSpot = {
  id: string;
  name: string;
  type: string;
  priceRange: string;
  description: string;
  tags: CategoryTag[];
};

type PackingItem = {
  id: string;
  label: string;
  detail: string;
  tags: CategoryTag[];
};

type ExploreResponse = {
  location: string;
  itineraries: Itinerary[];
  eats: EatSpot[];
  sleeps: SleepSpot[];
  packing: PackingItem[];
};

type ExploreInput = {
  location?: string;
  days?: number;
  categories?: CategoryTag[];
  budget?: BudgetLevel;
};

const model = "gpt-4o-mini";

const systemPrompt = `
You are a concise trip and activity planner.
Return a single JSON object with 4 arrays: itineraries, eats, sleeps, packing.
Respond in English. Never include extra keys or text.

Rules:
- Make results achievable and grounded in the requested location.
- Do not invent precise addresses or coordinates.
- Budget levels: 1=€ , 2=€€ , 3=€€€.
- Distances must be short human-friendly strings like "900 m" or "2.3 km".
- Stops should be brief bullet-like strings.
- Keep titles tight and inviting.
- If not enough info, keep arrays small but non-empty with reasonable defaults.
- Respect categories: only use tags from
  ["highlights","walks","hikes","museums","food","cafes","bars","markets","nightlife","family","design"].
`;

const userPrompt = (input: ExploreInput) => `
Plan ideas for:
- location: ${input.location ?? "nearby"}
- days: ${input.days ?? 3}
- budget max: ${input.budget ?? 2} (1=€,2=€€,3=€€€)
- focus tags: ${input.categories && input.categories.length > 0 ? input.categories.join(",") : "any"}

Output JSON with shape:
{
  "location": "<string>",
  "itineraries": [{ "id": "slug", "title": "", "description": "", "days": <number>, "stops": ["",""], "tags": ["highlights"] }],
  "eats": [{ "id": "slug", "name": "", "category": "", "budget": 1, "description": "", "distance": "1.2 km", "tags": ["food"] }],
  "sleeps": [{ "id": "slug", "name": "", "type": "", "priceRange": "€€", "description": "", "tags": ["design"] }],
  "packing": [{ "id": "slug", "label": "", "detail": "", "tags": ["walks"] }]
}

Prefer 1–3 items per array.`;

const toJson = <T>(text: string): T => JSON.parse(text);

const handleRequest = async (input: ExploreInput): Promise<Response> => {
  const payload: ExploreInput = {
    location: input.location ?? "Near me",
    days: Math.min(Math.max(input.days ?? 3, 1), 14),
    categories: input.categories ?? [],
    budget: (input.budget ?? 2) as BudgetLevel,
  };

  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt(payload) },
      ],
      temperature: 0.6,
      max_tokens: 900,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = toJson<ExploreResponse>(raw);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("[home-explore] error", error);
    return new Response(
      JSON.stringify({ error: "generation_failed", detail: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: ExploreInput = {};
  try {
    body = await req.json();
  } catch (err) {
    console.log("[home-explore] invalid JSON", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  return handleRequest(body);
});
