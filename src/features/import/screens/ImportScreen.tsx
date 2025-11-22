import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
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
import {
  deleteActivity,
  fetchActivities,
} from "@features/activities/store/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import ImportDetailsSheet, {
  type ImportDetailsSheetHandle,
} from "../components/ImportDetailsSheet";
import type { Activity } from "@features/activities/utils/types";
import { UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";

const ImportScreen = () => {
  const { shared } = useLocalSearchParams();
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
  const sheetRef = useRef(null);
  const detailsRef = useRef<ImportDetailsSheetHandle>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
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
      setSheetOpen(true);
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
        );
        setSheetOpen(false);
        setHasUnsavedChanges(false);
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

  const discardActivity = async () => {
    if (!activity) {
      setSheetOpen(false);
      return;
    }
    await dispatch(deleteActivity(activity.id));
    await dispatch(fetchActivities());
    setSheetOpen(false);
    setHasUnsavedChanges(false);
  };

  const handleCancelSheet = () => {
    if (!activity) {
      setSheetOpen(false);
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

    setSheetOpen(false);
  };

  return (
    <Screen loading={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("import:header.title")}</Text>
        <Text style={styles.subtitle}>{t("import:header.subtitle")}</Text>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{t("import:linkInput.label")}</Text>
        <TextInput
          style={styles.input}
          value={sharedData?.webUrl}
          placeholder={t("import:linkInput.placeholder")}
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
        />
        <Pressable
          style={[
            styles.analyzeBtn,
            (loading || !sharedData?.webUrl || hasAnalyzedRef.current) &&
              styles.analyzeBtnDisabled,
          ]}
          onPress={analyze}
          disabled={loading || !sharedData?.webUrl || hasAnalyzedRef.current}
        >
          <Text style={styles.analyzeBtnText}>
            {loading
              ? t("import:linkInput.analyzing")
              : t("import:linkInput.analyze")}
          </Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {activity && sheetOpen && (
        <AppBottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={["75%"]}
          onClose={handleCancelSheet}
          scrollable
          footer={
            <View style={styles.sheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={handleCancelSheet}>
                <Text style={styles.cancelBtnText}>
                  {t("import:details.cancel")}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveBtn,
                  !hasUnsavedChanges && styles.saveBtnDisabled,
                ]}
                disabled={!hasUnsavedChanges}
                onPress={handleSavePress}
              >
                <Text style={styles.saveBtnText}>
                  {t("import:details.saveChanges")}
                </Text>
              </Pressable>
            </View>
          }
        >
          <ImportDetailsSheet
            ref={detailsRef}
            activity={activity}
            onSave={handleSaveDetails}
            onCancel={handleCancelSheet}
            onDirtyChange={setHasUnsavedChanges}
          />
        </AppBottomSheet>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
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
  error: { color: "#c00", marginTop: 8 },
  sheetFooter: {
    paddingTop: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#64748b",
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  saveBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});

export default ImportScreen;
