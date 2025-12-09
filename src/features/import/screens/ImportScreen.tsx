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
import ImportLoader from "../components/ImportLoader";
import type { Activity } from "@features/activities/utils/types";
import { UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import ActivityHero from "@common/components/ActivityHero";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors, mode } = useAppTheme();

  const loading = useAppSelector(selectImportLoading);
  const error = useAppSelector(selectImportError);
  const activity = useAppSelector(selectImportedActivity) as Activity | null;
  const activities = useAppSelector((state) => state.activities.items);
  const knownActivityIdsRef = useRef<Set<string>>(new Set());
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
  const screenLoading = loading || (hasSharedParam && !activity && !showError);
  const alreadyHadActivity = activity
    ? knownActivityIdsRef.current.has(activity.id)
    : false;
  const displayActivity = useMemo(() => {
    if (!activity) return null;
    const linked = activities.find((item) => item.id === activity.id);
    return linked ?? activity;
  }, [activities, activity]);
  const displayNeedsDate = displayActivity
    ? categoryNeedsDate(displayActivity.category)
    : false;

  const hasAnalyzedRef = useRef(false);
  const detailsRef = useRef<ImportDetailsFormHandle>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const trimmedLink = manualLink.trim();
  const canAnalyzeManual =
    isValidHttpUrl(trimmedLink) && !loading && !sharedUrl;

  useFocusEffect(
    useCallback(() => {
      dispatch(resetImport());
      setManualLink("");
      setHasUnsavedChanges(false);
      hasAnalyzedRef.current = false;
      knownActivityIdsRef.current = new Set(activities.map((item) => item.id));
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
    if (activity) {
      setHasUnsavedChanges(!alreadyHadActivity);
    }
  }, [activity, alreadyHadActivity]);

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
      loadingContent={<ImportLoader message={t("import:loader.message")} />}
      scrollable
      onBackPress={
        alreadyHadActivity || !fromActivities ? handleGoHome : handleBackPress
      }
      footer={
        activity && !alreadyHadActivity ? (
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
        {showError ? (
          <ImportErrorState message={error} onGoHome={handleGoHome} />
        ) : null}

        {!hasSharedParam && !displayActivity ? (
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
          alreadyHadActivity ? (
            <View
              style={[
                styles.alreadyHaveCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ActivitySummaryHeader
                title={displayActivity.title ?? t("common:labels.activity")}
                category={displayActivity.category}
                location={
                  formatActivityLocation(displayActivity) ??
                  t("import:details.locationFallback")
                }
                dateLabel={
                  displayNeedsDate
                    ? (formatDisplayDate(
                        getOfficialDateValue(displayActivity)
                      ) ?? t("activities:details.dateMissing"))
                    : undefined
                }
                style={styles.headerBlock}
              />
              <ActivityHero
                title={displayActivity.title ?? t("common:labels.activity")}
                category={displayActivity.category}
                location={
                  formatActivityLocation(displayActivity) ??
                  t("import:details.locationFallback")
                }
                dateLabel={
                  displayNeedsDate
                    ? (formatDisplayDate(
                        getOfficialDateValue(displayActivity)
                      ) ?? t("activities:details.dateMissing"))
                    : undefined
                }
                imageUrl={displayActivity.image_url}
                showOverlayContent={false}
              />
              {alreadyHadActivity ? (
                <Text style={[styles.alreadyHaveTitle, { color: colors.text }]}>
                  {t("import:result.alreadyOwned")}
                </Text>
              ) : null}
              <Pressable
                style={[
                  styles.returnHomeBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleGoHome}
              >
                <Text
                  style={[
                    styles.returnHomeText,
                    {
                      color:
                        mode === "dark" ? colors.background : colors.surface,
                    },
                  ]}
                >
                  {t("import:errorState.homeCta")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <ImportResultCard
              activity={activity}
              detailsRef={detailsRef}
              onSave={handleSaveDetails}
              onCancel={handleCancelDetails}
              onDirtyChange={setHasUnsavedChanges}
              userId={user?.id ?? null}
            />
          )
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
  alreadyHaveCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  alreadyHaveTitle: {},
  returnHomeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  returnHomeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerBlock: {
    paddingHorizontal: 4,
  },
});

export default ImportScreen;
