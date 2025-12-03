import type { AnalyzerMappedActivity } from "./mediaAnalyzer.ts";

const ANALYZER_CONFIDENCE_THRESHOLD = 0.65;

const hasCoords = (activity: AnalyzerMappedActivity): boolean =>
  typeof activity.latitude === "number" &&
  typeof activity.longitude === "number";

const hasLocation = (activity: AnalyzerMappedActivity): boolean =>
  Boolean(activity.location_name || activity.city || hasCoords(activity));

const hasDates = (activity: AnalyzerMappedActivity): boolean =>
  Array.isArray(activity.dates) && activity.dates.length > 0;

/**
 * Decide whether to call the slower OpenAI extraction, based on
 * media-analyzer output quality and confidence.
 */
export const shouldInvokeAI = (
  analyzerActivity: AnalyzerMappedActivity | null,
  threshold: number = ANALYZER_CONFIDENCE_THRESHOLD
): boolean => {
  if (!analyzerActivity) return true;

  const analyzerHasCore =
    Boolean(analyzerActivity.category) && (hasLocation(analyzerActivity) || hasDates(analyzerActivity));

  const analyzerConfidence =
    typeof analyzerActivity.confidence === "number"
      ? analyzerActivity.confidence
      : null;

  if (!analyzerHasCore) return true;
  if (analyzerConfidence !== null && analyzerConfidence < threshold) return true;

  return false;
};

export { ANALYZER_CONFIDENCE_THRESHOLD };
