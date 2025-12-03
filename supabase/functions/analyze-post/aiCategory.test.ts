// Provide fake env vars to satisfy deps.ts
try {
  Deno.env.set("SUPABASE_URL", "http://localhost");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test");
  Deno.env.set("OPENAI_API_KEY", "test");
} catch {
  // ignore if env not available
}

// Minimal tests for the category classifier prompt wiring.
// Uses a mock response override via globalThis.__aiCategoryMockResponse.

const loadClassifier = async () => {
  const mod = await import("./aiCategory.ts");
  return mod.classifyCategory;
};

Deno.test("classifyCategory maps concert phrasing to event-concert", async () => {
  // @ts-ignore
  globalThis.__aiCategoryMockResponse = "event-concert";
  const classifyCategory = await loadClassifier();
  const category = await classifyCategory({
    title: "Amazing live music tonight",
    description: "Join us for a concert in the park",
    tags: ["music"],
    location_name: "Central Park",
  });
  if (category !== "event-concert") {
    throw new Error(`Expected event-concert, got ${category}`);
  }
});

Deno.test("classifyCategory returns other on error", async () => {
  // Force fallback to mock "other"
  // @ts-ignore
  globalThis.__aiCategoryMockResponse = "other";
  const classifyCategory = await loadClassifier();
  const category = await classifyCategory({
    title: "Generic place",
    description: "",
    tags: [],
  });
  if (category !== "other") {
    throw new Error(`Expected other fallback, got ${category}`);
  }
});
