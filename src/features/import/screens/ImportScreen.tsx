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
  saveImportedActivityDetails,
  resetImport,
} from "@features/import/store/importSlice";
import {
  fetchActivities,
  cancelActivity,
} from "@features/activities/store/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import ImportHeader from "../components/ImportHeader";
import ManualLinkCard from "../components/ManualLinkCard";
import ImportResultCard from "../components/ImportResultCard";
import type { ImportDetailsFormHandle } from "../components/ImportDetailsForm";
import ImportFooter from "../components/ImportFooter";
import ImportErrorState from "../components/ImportErrorState";
import type { Activity } from "@features/activities/utils/types";
import { UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";

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
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();

  const loading = useAppSelector(selectImportLoading);
  const error = useAppSelector(selectImportError);
  const activity = useAppSelector(selectImportedActivity) as Activity | null;
  const sharedData = useMemo<ShareIntent | null>(() => {
    if (!shared || Array.isArray(shared)) return null;
    try {
      return JSON.parse(shared) as ShareIntent;
    } catch {
      return null;
    }
  }, [shared]);
  const [manualLink, setManualLink] = useState("");
  const screenLoading =
    loading || (!!sharedData?.webUrl && !activity && !error);

  const hasAnalyzedRef = useRef(false);
  const detailsRef = useRef<ImportDetailsFormHandle>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const trimmedLink = manualLink.trim();
  const canAnalyzeManual =
    isValidHttpUrl(trimmedLink) && !loading && !sharedData?.webUrl;

  useFocusEffect(
    useCallback(() => {
      dispatch(resetImport());
      setManualLink("");
      setHasUnsavedChanges(false);
      hasAnalyzedRef.current = false;
    }, [dispatch])
  );

  const triggerAnalyze = useCallback(
    (payload: ShareIntent) => {
      if (!user?.id || hasAnalyzedRef.current) return;
      hasAnalyzedRef.current = true;
      dispatch(
        analyzeSharedLink({
          shared: payload,
          userId: user.id,
        })
      ).finally(() => {
        hasAnalyzedRef.current = false;
      });
    },
    [dispatch, user?.id]
  );

  const handleManualAnalyze = useCallback(() => {
    if (!isValidHttpUrl(trimmedLink) || loading || !user?.id) return;

    triggerAnalyze({
      webUrl: trimmedLink,
      text: trimmedLink,
    } as ShareIntent);
  }, [loading, triggerAnalyze, trimmedLink, user?.id]);

  useEffect(() => {
    if (sharedData?.webUrl && user?.id) {
      triggerAnalyze(sharedData);
    }
  }, [sharedData, triggerAnalyze, user?.id]);

  useEffect(() => {
    if (activity) {
      setHasUnsavedChanges(true);
    }
  }, [activity]);

  useEffect(() => {
    if (activity || error) {
      hasAnalyzedRef.current = false;
    }
  }, [activity, error]);

  const handleSaveDetails = (payload: UpdateActivityPayload) => {
    if (!activity) return;

    confirm(
      t("import:confirm.saveTitle"),
      t("import:confirm.saveMessage"),
      () => {
        dispatch(
          saveImportedActivityDetails({
            activityId: activity.id,
            ...payload,
          })
        ).finally(() => {
          setHasUnsavedChanges(false);
          router.replace("/");
        });
      },
      {
        cancelText: t("common:buttons.cancel"),
        confirmText: t("common:buttons.save"),
      }
    );
  };

  const handleSavePress = useCallback(() => {
    detailsRef.current?.save();
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoHome = useCallback(() => {
    dispatch(resetImport());
    setHasUnsavedChanges(false);
    router.replace("/");
  }, [dispatch, router]);

  const discardActivity = async () => {
    if (!activity) {
      return;
    }
    try {
      await dispatch(cancelActivity(activity.id)).unwrap();
      await dispatch(fetchActivities());
    } finally {
      dispatch(resetImport());
      setHasUnsavedChanges(false);
      router.replace("/");
    }
  };

  const handleCancelDetails = () => {
    if (!activity) {
      return;
    }

    if (hasUnsavedChanges) {
      confirm(
        t("import:confirm.discardTitle"),
        t("import:confirm.discardMessage"),
        () => {
          void discardActivity();
        },
        {
          cancelText: t("common:buttons.keep"),
          confirmText: t("common:buttons.discard"),
        }
      );
      return;
    }

    void discardActivity();
  };

  return (
    <Screen
      loading={screenLoading}
      scrollable
      onBackPress={fromActivities ? handleBackPress : undefined}
      footer={
        activity ? (
          <ImportFooter
            disabled={!hasUnsavedChanges}
            onCancel={handleCancelDetails}
            onSave={handleSavePress}
          />
        ) : null
      }
    >
      <View style={styles.container}>
        <ImportHeader
          title={t("import:header.title")}
          subtitle={t("import:header.subtitle")}
        />
        {error ? (
          <ImportErrorState message={error} onGoHome={handleGoHome} />
        ) : null}

        {!sharedData?.webUrl ? (
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
            helperText={t("import:linkInput.helper", {
              defaultValue: "Paste a full http(s) link to start.",
            })}
          />
        ) : null}

        {activity ? (
          <ImportResultCard
            activity={activity}
            detailsRef={detailsRef}
            onSave={handleSaveDetails}
            onCancel={handleCancelDetails}
            onDirtyChange={setHasUnsavedChanges}
          />
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
