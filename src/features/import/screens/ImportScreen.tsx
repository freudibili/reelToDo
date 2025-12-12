import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { ShareIntent } from "expo-share-intent";
import { useTranslation } from "react-i18next";

import { showToast as showToastAction } from "@common/store/appSlice";
import { Stack } from "@common/designSystem";
import Screen from "@common/components/AppScreen";
import { cancelActivity, fetchActivities } from "@features/activities/store/activitiesSlice";
import type {
  Activity,
  ActivityProcessingStatus,
} from "@features/activities/utils/types";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import ImportErrorState from "../components/ImportErrorState";
import ImportHeader from "../components/ImportHeader";
import ManualLinkCard from "../components/ManualLinkCard";
import ProcessingStateCard from "../components/ProcessingStateCard";
import { useActivityProcessingWatcher } from "../hooks/useActivityProcessingWatcher";
import { useImportNotificationPermission } from "../hooks/useImportNotificationPermission";
import { useImportProcessingState } from "../hooks/useImportProcessingState";
import {
  analyzeSharedLink,
  resetImport,
  restartImportProcessing,
} from "../store/importSlice";
import {
  selectImportError,
  selectImportLoading,
  selectImportedActivity,
} from "../store/importSelectors";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { parseSharedIntent, isValidHttpUrl } from "../utils/sharedIntent";

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
  const parsedShared = useMemo(() => parseSharedIntent(shared), [shared]);
  const sharedData = parsedShared.data;
  const sharedUrl = parsedShared.sharedUrl;
  const hasSharedParam = !!parsedShared.raw;
  const [manualLink, setManualLink] = useState(() => sharedData?.text ?? "");

  const {
    displayActivity,
    processingStatus,
    isProcessing,
    isFailed,
    processingErrorMessage,
    showAnalyzingCard,
    showManualCard,
  } = useImportProcessingState({
    activity: activity as Activity | null,
    activities,
    error,
    loading,
    hasSharedParam,
  });
  const showError = !!error && !displayActivity;

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
      setManualLink(sharedData?.text ?? "");
      hasAnalyzedRef.current = false;
    }, [dispatch, sharedData?.text])
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
    if (!displayActivity?.id || !user?.id) return;
    dispatch(
      restartImportProcessing({
        activityId: displayActivity.id,
        userId: user.id,
      })
    );
  }, [dispatch, displayActivity?.id, user?.id]);

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
    if (displayActivity || error) {
      hasAnalyzedRef.current = false;
    }
  }, [displayActivity, error]);

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
      <Stack gap="lg" fullWidth style={styles.container}>
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
      </Stack>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
});

export default ImportScreen;
