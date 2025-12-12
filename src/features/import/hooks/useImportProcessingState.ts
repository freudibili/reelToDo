import { useMemo } from "react";

import type { Activity } from "@features/activities/types";

import type { ImportProcessingState } from "../types";

type Params = {
  activity: Activity | null;
  activities: Activity[];
  error: string | null;
  loading: boolean;
  hasSharedParam: boolean;
};

export const useImportProcessingState = ({
  activity,
  activities,
  error,
  loading,
  hasSharedParam,
}: Params): ImportProcessingState => {
  const displayActivity = useMemo(() => {
    if (!activity) return null;
    const linked = activities.find((item) => item.id === activity.id);
    return linked ?? activity;
  }, [activities, activity]);

  const processingStatus = (displayActivity?.processing_status ??
    "complete") as ImportProcessingState["processingStatus"];
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";
  const processingErrorMessage =
    displayActivity?.processing_error ?? error ?? null;
  const showAnalyzingCard =
    !displayActivity && !error && (loading || hasSharedParam);
  const showManualCard = !hasSharedParam && !displayActivity && !loading;

  return {
    displayActivity,
    processingStatus,
    isProcessing,
    isFailed,
    processingErrorMessage,
    showAnalyzingCard,
    showManualCard,
  };
};
