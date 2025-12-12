import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "@common/components/AppScreen";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { useActivityDetails } from "@features/activities/hooks/useActivityDetails";
import ProcessingStateCard from "@features/import/components/ProcessingStateCard";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { showToast as showToastAction } from "@common/store/appSlice";
import { activityUpdated, cancelActivity, deleteActivity } from "../store/activitiesSlice";
import type { PlaceDetails } from "@features/import/services/locationService";
import ActivityLocationEditorCard from "../components/ActivityLocationEditorCard";
import {
  derivePlaceFromActivity,
  resolveLocationStatus,
  hasLocationChanged,
  saveActivityLocation,
} from "../utils/locationEditor";

const ActivityScreen = () => {
  const { id } = useLocalSearchParams();
  const activityId = useMemo(
    () => (Array.isArray(id) ? id[0] : id) ?? null,
    [id]
  );
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [draftLocation, setDraftLocation] = useState<PlaceDetails | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);
  const { activity, loading } = useActivityDetails(activityId);
  const processingStatus = activity?.processing_status ?? "complete";
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";

  const displayNeedsDate = activity
    ? categoryNeedsDate(activity.category)
    : false;
  const locationLabel = useMemo(() => {
    if (draftLocation) {
      return draftLocation.formattedAddress || draftLocation.name || draftLocation.description;
    }
    if (activity && formatActivityLocation(activity)) {
      return formatActivityLocation(activity);
    }
    return activity ? t("import:details.locationFallback") : null;
  }, [activity, draftLocation, t]);
  const dateLabel =
    activity && displayNeedsDate
      ? formatDisplayDate(getOfficialDateValue(activity)) ??
        t("activities:details.dateMissing")
      : null;

  const headerTitle = activity?.title ?? t("common:labels.activity");

  useEffect(() => {
    setDraftLocation(null);
  }, [activity?.id]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      dispatch(showToastAction({ message, type }));
    },
    [dispatch],
  );

  const handleLocationSelected = useCallback((place: PlaceDetails) => {
    setDraftLocation(place);
  }, []);

  const handleSaveLocation = useCallback(async () => {
    if (!activity?.id) return;
    const location = draftLocation ?? derivePlaceFromActivity(activity);

    if (!location) {
      showToast(t("activities:toasts.locationSaveError"), "error");
      return;
    }

    const exitScreen = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/activities" as never);
      }
    };

    const needsConfirm = locationStatus?.needsConfirmation ?? false;

    if (!hasLocationChanged(activity, location) && !needsConfirm) {
      exitScreen();
      return;
    }

    setSavingLocation(true);
    try {
      const updated = await saveActivityLocation(activity.id, location);
      dispatch(activityUpdated(updated));
      setDraftLocation(null);
      showToast(t("activities:toasts.locationSaved"), "success");
      exitScreen();
    } catch (err) {
      console.log("[activity] save location failed", err);
      showToast(t("activities:toasts.locationSaveError"), "error");
    } finally {
      setSavingLocation(false);
    }
  }, [activity, draftLocation, dispatch, locationStatus?.needsConfirmation, router, showToast, t]);

  const handleDeleteActivity = useCallback(() => {
    if (!activity?.id || !userId) {
      showToast(t("activities:toasts.deleteError"), "error");
      return;
    }
    if (deletingActivity) return;
    const isOwner = activity.user_id === userId;
    setDeletingActivity(true);
    const thunk = isOwner ? deleteActivity : cancelActivity;
    dispatch(thunk(activity.id))
      .unwrap()
      .then(() => {
        showToast(t("activities:toasts.deleteSuccess"), "success");
        router.replace("/activities" as never);
      })
      .catch((err) => {
        console.log("[activity] delete failed", err);
        showToast(t("activities:toasts.deleteError"), "error");
      })
      .finally(() => {
        setDeletingActivity(false);
      });
  }, [activity?.id, activity?.user_id, dispatch, router, showToast, t, userId, deletingActivity]);

  const locationStatus = useMemo(
    () => (activity ? resolveLocationStatus(activity, t) : null),
    [activity, t],
  );

  return (
    <Screen
      headerTitle={headerTitle}
      onBackPress={() => router.back()}
      loading={loading && !activity}
      scrollable
    >
      {!activity && loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : null}

      {!activity && !loading ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.text }}>
            {t("activities:errors.notFound")}
          </Text>
        </View>
      ) : null}

      {activity ? (
        <View style={styles.content}>
          {isProcessing ? (
            <ProcessingStateCard mode="processing" />
          ) : null}

          {isFailed ? (
            <ProcessingStateCard
              mode="failed"
              message={activity.processing_error}
            />
          ) : null}

          <ActivityHero
            title={activity.title ?? t("common:labels.activity")}
            category={activity.category}
            location={locationLabel ?? t("import:details.locationFallback")}
            dateLabel={dateLabel ?? undefined}
            imageUrl={activity.image_url}
            showOverlayContent={false}
          />

          <ActivitySummaryHeader
            title={activity.title ?? t("common:labels.activity")}
            category={activity.category}
            location={locationLabel ?? t("import:details.locationFallback")}
            dateLabel={dateLabel ?? undefined}
          />

          {locationStatus ? (
            <ActivityLocationEditorCard
              activity={activity}
              status={locationStatus}
              draftLocation={draftLocation}
              onChangeLocation={handleLocationSelected}
              onSave={handleSaveLocation}
              onCancelActivity={handleDeleteActivity}
              saving={savingLocation}
              deleting={deletingActivity}
            />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  content: {
    gap: 14,
    paddingBottom: 24,
  },
});

export default ActivityScreen;
