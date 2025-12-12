import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { ShareIntent } from "expo-share-intent";

import { selectAuthUser } from "@features/auth/store/authSelectors";
import {
  selectImportLoading,
  selectImportError,
  selectImportedActivity,
} from "@features/import/store/importSelectors";
import {
  analyzeSharedLink,
  resetImport,
  restartImportProcessing,
} from "@features/import/store/importSlice";
import { fetchActivities, cancelActivity } from "@features/activities/store/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import Screen from "@common/components/AppScreen";
import ImportHeader from "../components/ImportHeader";
import ManualLinkCard from "../components/ManualLinkCard";
import ImportErrorState from "../components/ImportErrorState";
import type {
  Activity,
  ActivityProcessingStatus,
} from "@features/activities/utils/types";
import { useTranslation } from "react-i18next";
import { useActivityProcessingWatcher } from "../hooks/useActivityProcessingWatcher";
import ProcessingStateCard from "../components/ProcessingStateCard";
import { useImportNotificationPermission } from "../hooks/useImportNotificationPermission";
import { showToast as showToastAction } from "@common/store/appSlice";

const isValidHttpUrl = (input: string) => {
  if (!input) return false;
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ImportScreen = () => {
  const { shared, from } = useLocalSearchParams();
  const fromParam = Array.isArray(from) ? from[0] : from;
  const fromActivities = fromParam === "activities";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { t } = useTranslation();
  const requestNotificationPermission = useImportNotificationPermission(
    user?.id ?? null
  );
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      dispatch(showToastAction({ message, type }));
    },
    [dispatch]
  );

  const loading = useAppSelector(selectImportLoading);
  const error = useAppSelector(selectImportError);
  const activity = useAppSelector(selectImportedActivity) as Activity | null;
  const activities = useAppSelector((state) => state.activities.items);
  const hasSharedParam = !!shared && !Array.isArray(shared);
  const showError = error && !activity;
  const sharedData = useMemo<ShareIntent | null>(() => {
    if (!shared || Array.isArray(shared)) return null;

    const attemptParse = (raw: string) => {
      try {
        return JSON.parse(raw) as ShareIntent;
      } catch {
        return null;
      }
    };

    // Try decoded then raw.
    return (
      attemptParse(shared) ||
      attemptParse(
        (() => {
          try {
            return decodeURIComponent(shared);
          } catch {
            return shared;
          }
        })()
      )
    );
  }, [shared]);
  const sharedUrl = useMemo(() => {
    const candidate = sharedData?.webUrl;
    if (candidate && isValidHttpUrl(candidate)) return candidate;
    if (sharedData?.text) {
      const match = sharedData.text.match(/https?:\/\/\\S+/i);
      if (match && isValidHttpUrl(match[0])) {
        return match[0];
      }
    }
    return null;
  }, [sharedData]);
  const [manualLink, setManualLink] = useState("");
  const displayActivity = useMemo(() => {
    if (!activity) return null;
    const linked = activities.find((item) => item.id === activity.id);
    return linked ?? activity;
  }, [activities, activity]);
  const processingStatus = (displayActivity?.processing_status ??
    "complete") as ActivityProcessingStatus;
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";
  const processingErrorMessage =
    displayActivity?.processing_error ?? error ?? null;
  const showAnalyzingCard =
    !displayActivity && !showError && (loading || hasSharedParam);
  const showManualCard = !hasSharedParam && !displayActivity && !loading;

  const hasAnalyzedRef = useRef(false);
  const lastStatusRef = useRef<{
    id: string;
    status: ActivityProcessingStatus | null;
  } | null>(null);
  const lastActivityIdRef = useRef<string | null>(null);
  const clearingRef = useRef(false);
  const trimmedLink = manualLink.trim();
  const canAnalyzeManual =
    isValidHttpUrl(trimmedLink) && !loading && !sharedUrl;

  useFocusEffect(
    useCallback(() => {
      dispatch(resetImport());
      setManualLink("");
      hasAnalyzedRef.current = false;
    }, [dispatch])
  );

  const triggerAnalyze = useCallback(
    (payload: ShareIntent) => {
      if (!user?.id || hasAnalyzedRef.current) return;
      hasAnalyzedRef.current = true;
      void requestNotificationPermission();
      dispatch(
        analyzeSharedLink({
          shared: payload,
          userId: user.id,
        })
      ).finally(() => {
        hasAnalyzedRef.current = false;
      });
    },
    [dispatch, requestNotificationPermission, user?.id]
  );

  const handleManualAnalyze = useCallback(() => {
    if (!isValidHttpUrl(trimmedLink) || loading || !user?.id) return;

    triggerAnalyze({
      webUrl: trimmedLink,
      text: trimmedLink,
    } as ShareIntent);
  }, [loading, triggerAnalyze, trimmedLink, user?.id]);

  const handleRetryProcessing = useCallback(() => {
    if (!activity?.id || !user?.id) return;
    dispatch(
      restartImportProcessing({
        activityId: activity.id,
        userId: user.id,
      })
    );
  }, [activity?.id, dispatch, user?.id]);

  useEffect(() => {
    if (!sharedUrl && sharedData?.text && !manualLink) {
      setManualLink(sharedData.text);
    }
  }, [sharedData?.text, manualLink, sharedUrl]);

  useEffect(() => {
    if (sharedUrl && user?.id) {
      triggerAnalyze({
        webUrl: sharedUrl,
        text: sharedData?.text ?? sharedUrl,
      } as ShareIntent);
    }
  }, [sharedData?.text, sharedUrl, triggerAnalyze, user?.id]);

  useEffect(() => {
    if (activity || error) {
      hasAnalyzedRef.current = false;
    }
  }, [activity, error]);

  const handleProcessingFailure = useCallback(
    async (activityId: string, alreadyDeleted = false) => {
      if (clearingRef.current) return;
      clearingRef.current = true;
      try {
        if (!alreadyDeleted) {
          await dispatch(cancelActivity(activityId)).unwrap();
        }
        await dispatch(fetchActivities());
        showToast(t("import:toast.failed"), "error");
      } catch {
        showToast(t("import:toast.failed"), "error");
      } finally {
        dispatch(resetImport());
      lastStatusRef.current = null;
      lastActivityIdRef.current = null;
      setManualLink("");
      router.replace("/import" as never);
      clearingRef.current = false;
    }
  },
  [dispatch, showToast, t, router]
);

  const handleActivityDeleted = useCallback(() => {
    const deletedId = lastActivityIdRef.current;
    if (deletedId) {
      void handleProcessingFailure(deletedId, true);
    }
  }, [handleProcessingFailure]);

  useActivityProcessingWatcher(
    displayActivity?.id ?? null,
    isProcessing,
    handleActivityDeleted
  );

  useEffect(() => {
    if (!displayActivity) {
      lastStatusRef.current = null;
      return;
    }

    const prev =
      lastStatusRef.current?.id === displayActivity.id
        ? lastStatusRef.current.status
        : null;

    lastActivityIdRef.current = displayActivity.id;

    if (processingStatus === "failed" && prev !== "failed") {
      void handleProcessingFailure(displayActivity.id);
    }

    lastStatusRef.current = {
      id: displayActivity.id,
      status: processingStatus,
    };
  }, [
    displayActivity,
    handleProcessingFailure,
    processingStatus,
    showToast,
    t,
    router,
  ]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoHome = useCallback(() => {
    dispatch(resetImport());
    router.replace("/");
  }, [dispatch, router]);

  return (
    <Screen
      scrollable
      onBackPress={!fromActivities ? handleGoHome : handleBackPress}
    >
      <View style={styles.container}>
        <ImportHeader
          title={t("import:header.title")}
          subtitle={t("import:header.subtitle")}
        />
        {showError ? (
          <ImportErrorState message={error} onGoHome={handleGoHome} />
        ) : null}

        {showAnalyzingCard ? (
          <ProcessingStateCard
            mode="processing"
            message={t("import:loader.message")}
            showAnimation
          />
        ) : null}

        {showManualCard ? (
          <ManualLinkCard
            value={manualLink}
            onChange={setManualLink}
            onAnalyze={handleManualAnalyze}
            loading={loading}
            canAnalyze={canAnalyzeManual}
            label={t("import:linkInput.label")}
            placeholder={t("import:linkInput.placeholder")}
            analyzingLabel={t("import:linkInput.analyzing")}
            analyzeLabel={t("import:linkInput.analyze")}
            helperText={t("import:linkInput.helper")}
          />
        ) : null}

        {displayActivity ? (
          isProcessing ? (
            <ProcessingStateCard mode="processing" showAnimation />
          ) : isFailed ? (
            <ProcessingStateCard
              mode="failed"
              message={processingErrorMessage}
              loading={loading}
              onRetry={handleRetryProcessing}
              onSecondary={handleGoHome}
              secondaryLabel={t("import:processing.backHome")}
            />
          ) : null
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: "stretch",
    marginTop: 16,
  },
});

export default ImportScreen;
