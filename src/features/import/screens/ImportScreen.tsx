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
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
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
import { deleteActivity } from "@features/activities/store/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";
import Screen from "@common/components/AppScreen";
import AppBottomSheet from "@common/components/AppBottomSheet";
import ImportDetailsSheet from "../components/ImportDetailsSheet";
import type { Activity } from "@features/activities/utils/types";

const ImportScreen = () => {
  const { shared } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { confirm } = useConfirmDialog();

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
      setHasUnsavedChanges(false);
    }
  }, [activity]);

  useEffect(() => {
    if (activity || error) {
      hasAnalyzedRef.current = false;
    }
  }, [activity, error]);

  const handleSaveDetails = (payload: {
    locationName: string;
    city: string;
    dateIso: string | null;
  }) => {
    if (!activity) return;

    confirm(
      "Save activity?",
      "This will save this activity with the selected location and date.",
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
      { cancelText: "Cancel", confirmText: "Save" }
    );
  };

  const discardActivity = () => {
    if (!activity) {
      setSheetOpen(false);
      return;
    }
    dispatch(deleteActivity(activity.id));
    setSheetOpen(false);
    setHasUnsavedChanges(false);
  };

  const handleCancelSheet = () => {
    if (!activity) {
      setSheetOpen(false);
      return;
    }

    if (!hasUnsavedChanges) {
      discardActivity();
      return;
    }

    confirm(
      "Discard activity?",
      "If you cancel, this activity will be removed and not saved to your list.",
      () => {
        discardActivity();
      },
      { cancelText: "Keep", confirmText: "Discard" }
    );
  };

  return (
    <Screen loading={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>Import activity</Text>
        <Text style={styles.subtitle}>
          Share a Reel, TikTok or Short to ReelToDo, we analyze it for you.
        </Text>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>Link</Text>
        <TextInput
          style={styles.input}
          value={sharedData?.webUrl}
          placeholder="Paste link here"
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
            {loading ? "Analyzing..." : "Analyze"}
          </Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loaderText}>Analyzing your activity…</Text>
          </View>
        </View>
      )}

      {activity && sheetOpen && (
        <AppBottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={["75%"]}
          onClose={handleCancelSheet}
        >
          <ImportDetailsSheet
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
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
});

export default ImportScreen;
