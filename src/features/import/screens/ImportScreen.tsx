import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ShareIntent } from "expo-share-intent";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";

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
  const [manualLink, setManualLink] = useState("");

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

  const handleManualAnalyze = useCallback(() => {
    if (!user?.id) return;
    const trimmed = manualLink.trim();
    if (!trimmed || loading) return;
    hasAnalyzedRef.current = true;
    dispatch(
      analyzeSharedLink({
        shared: { webUrl: trimmed, text: trimmed } as ShareIntent,
        userId: user.id,
      })
    ).finally(() => {
      hasAnalyzedRef.current = false;
    });
  }, [dispatch, manualLink, user, loading]);

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
          <LinearGradient
            colors={["#0ea5e9", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroIcon}
          >
            <Icon source="link-variant" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>{t("import:header.title")}</Text>
          <Text style={styles.subtitle}>{t("import:header.subtitle")}</Text>
        </View>

        {error ? (
          <ImportErrorState message={error} onGoHome={handleGoHome} />
        ) : null}

        {!sharedData?.webUrl ? (
          <View style={styles.linkCard}>
            <Text style={styles.linkLabel}>{t("import:linkInput.label")}</Text>
            <View style={styles.linkRow}>
              <TextInput
                value={manualLink}
                onChangeText={setManualLink}
                placeholder={t("import:linkInput.placeholder")}
                placeholderTextColor="#94a3b8"
                style={styles.linkInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                editable={!loading}
              />
              <Pressable
                onPress={handleManualAnalyze}
                disabled={loading || !manualLink.trim()}
                style={({ pressed }) => [
                  styles.analyzePressable,
                  pressed && styles.analyzePressed,
                  (loading || !manualLink.trim()) && styles.analyzeDisabled,
                ]}
              >
                <View style={styles.analyzeBtn}>
                  <Icon source="link-plus" size={16} color="#0f172a" />
                  <Text style={styles.analyzeText}>
                    {loading
                      ? t("import:linkInput.analyzing")
                      : t("import:linkInput.analyze")}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
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
    gap: 12,
    alignItems: "center",
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  linkCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
    alignSelf: "stretch",
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  linkInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
  },
  analyzePressable: {
    borderRadius: 12,
  },
  analyzePressed: {
    opacity: 0.9,
  },
  analyzeDisabled: {
    opacity: 0.5,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  analyzeText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 12.5,
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
