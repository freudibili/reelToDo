import { shouldInvokeAI } from "./aiGate.ts";
import type { AnalyzerMappedActivity } from "./mediaAnalyzer.ts";

const assertEquals = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) {
    throw new Error(message ?? `Assertion failed: expected ${expected}, got ${actual}`);
  }
};

const baseActivity: AnalyzerMappedActivity = {
  title: null,
  category: null,
  location_name: null,
  address: null,
  city: null,
  country: null,
  latitude: null,
  longitude: null,
  date: null,
  dates: undefined,
  tags: [],
  creator: null,
  source_url: null,
  image_url: null,
  confidence: null,
};

const build = (overrides: Partial<AnalyzerMappedActivity>): AnalyzerMappedActivity => ({
  ...baseActivity,
  ...overrides,
});

Deno.test("shouldInvokeAI returns true when analyzer result is missing", () => {
  assertEquals(shouldInvokeAI(null), true);
});

Deno.test("shouldInvokeAI skips AI when analyzer is confident with core fields", () => {
  const analyzer = build({
    category: "food-restaurant",
    location_name: "Nice place",
    city: "Zurich",
    confidence: 0.8,
  });
  assertEquals(shouldInvokeAI(analyzer), false);
});

Deno.test("shouldInvokeAI runs AI when core fields are missing", () => {
  const analyzer = build({
    category: "food-restaurant",
    location_name: null,
    city: null,
    confidence: 0.9,
  });
  assertEquals(shouldInvokeAI(analyzer), true);
});

Deno.test("shouldInvokeAI runs AI when confidence is below threshold", () => {
  const analyzer = build({
    category: "event-concert",
    city: "Geneva",
    dates: ["2025-05-01"],
    confidence: 0.4,
  });
  assertEquals(shouldInvokeAI(analyzer), true);
});
