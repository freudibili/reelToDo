import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
} from "@features/import/store/importSlice";
import { resetImport } from "@features/import/store/importSlice";
import {
  fetchActivities,
  cancelActivity,
} from "@features/activities/store/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import ImportDetailsForm, {
  type ImportDetailsFormHandle,
} from "../components/ImportDetailsForm";
import ImportFooter from "../components/ImportFooter";
import ImportErrorState from "../components/ImportErrorState";
import type { Activity } from "@features/activities/utils/types";
import { UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";

const ImportScreen = () => {
  const { shared } = useLocalSearchParams();
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

  const hasAnalyzedRef = useRef(false);
  const detailsRef = useRef<ImportDetailsFormHandle>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const analyze = useCallback(() => {
    if (!sharedData?.webUrl || !user?.id || hasAnalyzedRef.current) return;
    hasAnalyzedRef.current = true;
    dispatch(
      analyzeSharedLink({
        shared: sharedData,
        userId: user.id,
      })
    );
  }, [dispatch, sharedData, user]);

  useEffect(() => {
    if (sharedData?.webUrl && user?.id) {
      analyze();
    }
  }, [sharedData?.webUrl, user?.id, analyze]);

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
      loading={loading}
      scrollable
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
        <View style={styles.header}>
          <Text style={styles.title}>{t("import:header.title")}</Text>
          <Text style={styles.subtitle}>{t("import:header.subtitle")}</Text>
        </View>

        {error ? (
          <ImportErrorState message={error} onGoHome={handleGoHome} />
        ) : null}

        {activity ? (
          <View style={styles.detailsCard}>
            <ImportDetailsForm
              ref={detailsRef}
              activity={activity}
              onSave={handleSaveDetails}
              onCancel={handleCancelDetails}
              onDirtyChange={setHasUnsavedChanges}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    gap: 10,
  },
  header: {
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  inputBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  analyzeBtn: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  analyzeBtnDisabled: {
    opacity: 0.5,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

export default ImportScreen;
