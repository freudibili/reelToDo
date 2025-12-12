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
  parseDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { useActivityDetails } from "@features/activities/hooks/useActivityDetails";
import ProcessingStateCard from "@features/import/components/ProcessingStateCard";
import DateChangeModal from "@features/activities/components/DateChangeModal";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { showToast as showToastAction } from "@common/store/appSlice";
import { activityUpdated, cancelActivity, deleteActivity } from "../store/activitiesSlice";
import type { PlaceDetails } from "@features/import/services/locationService";
import ActivityLocationEditorCard from "../components/ActivityLocationEditorCard";
import ActivityDateEditorCard from "../components/ActivityDateEditorCard";
import {
  derivePlaceFromActivity,
  resolveLocationStatus,
  hasLocationChanged,
  saveActivityLocation,
  resolveLocationAction,
} from "../utils/locationEditor";
import {
  hasDateChanged,
  resolveDateStatus,
  saveActivityDate,
  resolveDateAction,
} from "../utils/dateEditor";
import { ActivitiesService } from "../services/activitiesService";

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
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [dateNote, setDateNote] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);
  const { activity, loading } = useActivityDetails(activityId);
  const processingStatus = activity?.processing_status ?? "complete";
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";

  const displayNeedsDate = activity
    ? categoryNeedsDate(activity.category)
    : false;
  const officialDateValue = activity ? getOfficialDateValue(activity) : null;
  const officialDate = useMemo(
    () => parseDateValue(officialDateValue),
    [officialDateValue],
  );
  const isOwner = activity?.user_id
    ? userId
      ? activity.user_id === userId
      : false
    : true;
  const locationLabel = useMemo(() => {
    if (draftLocation) {
      return draftLocation.formattedAddress || draftLocation.name || draftLocation.description;
    }
    if (activity && formatActivityLocation(activity)) {
      return formatActivityLocation(activity);
    }
    return activity ? t("import:details.locationFallback") : null;
  }, [activity, draftLocation, t]);
  const dateStatus = useMemo(
    () => (activity ? resolveDateStatus(activity, t) : null),
    [activity, t],
  );
  const showDate = activity && (displayNeedsDate || !!dateStatus);
  const dateLabel =
    showDate && activity
      ? formatDisplayDate(draftDate ?? officialDate ?? officialDateValue) ??
        t("activities:details.dateMissing")
      : null;
  const locationStatus = useMemo(
    () => (activity ? resolveLocationStatus(activity, t) : null),
    [activity, t],
  );

  const headerTitle = activity?.title ?? t("common:labels.activity");

  useEffect(() => {
    setDraftLocation(null);
    setLocationNote(null);
    setDraftDate(null);
    setDateNote(null);
  }, [activity?.id]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      dispatch(showToastAction({ message, type }));
    },
    [dispatch],
  );

  const exitScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/activities" as never);
    }
  }, [router]);

  const handleLocationSelected = useCallback((payload: { place: PlaceDetails; note: string | null }) => {
    setDraftLocation(payload.place);
    setLocationNote(payload.note);
  }, []);

  const handleDateSelected = useCallback((date: Date, note?: string | null) => {
    setDraftDate(date);
    if (note !== undefined) {
      setDateNote(note);
    }
  }, []);

  const handleSaveDate = useCallback(async () => {
    if (!activity?.id) return;
    const dateAction = resolveDateAction({ activity, isOwner, draftDate });
    if (dateAction === "continue") {
      exitScreen();
      return;
    }
    const needsConfirm = dateStatus?.needsConfirmation ?? false;
    const dateToSave = draftDate ?? officialDate;

    if (!dateToSave) {
      showToast(t("activities:toasts.dateSaveError"), "error");
      return;
    }

    if (!hasDateChanged(activity, dateToSave) && !needsConfirm) {
      if (!locationStatus?.needsConfirmation) {
        exitScreen();
      }
      return;
    }

    setSavingDate(true);
    try {
      if (!isOwner) {
        if (dateAction !== "suggest") {
          exitScreen();
          return;
        }
        await ActivitiesService.submitDateSuggestion({
          activityId: activity.id,
          userId,
          suggestedDate: dateToSave,
          note: dateNote ?? null,
        });
        showToast(t("activities:details.suggestDateSuccessTitle"), "success");
        setDraftDate(null);
        setDateNote(null);
        exitScreen();
        return;
      }

      const updated = await saveActivityDate(activity.id, dateToSave);
      dispatch(activityUpdated(updated));
      setDraftDate(null);
      setDateNote(null);
      showToast(t("activities:toasts.dateSaved"), "success");
      if (!locationStatus?.needsConfirmation) {
        exitScreen();
      }
    } catch (err) {
      console.log("[activity] save date failed", err);
      showToast(t("activities:toasts.dateSaveError"), "error");
    } finally {
      setSavingDate(false);
    }
  }, [
    activity,
    dateStatus?.needsConfirmation,
    dispatch,
    draftDate,
    exitScreen,
    isOwner,
    dateNote,
    locationStatus?.needsConfirmation,
    officialDate,
    showToast,
    t,
    userId,
  ]);

  const handleSaveLocation = useCallback(async () => {
    if (!activity?.id) return;
    const locationAction = resolveLocationAction({ activity, isOwner, draftLocation });
    if (locationAction === "continue") {
      exitScreen();
      return;
    }
    const location = draftLocation ?? derivePlaceFromActivity(activity);

    if (!location) {
      showToast(t("activities:toasts.locationSaveError"), "error");
      return;
    }

    const needsConfirm = locationStatus?.needsConfirmation ?? false;

    if (!isOwner) {
      if (locationAction !== "suggest") {
        exitScreen();
        return;
      }
      setSavingLocation(true);
      try {
        if (hasLocationChanged(activity, location) || needsConfirm) {
          await ActivitiesService.submitLocationSuggestion({
            activityId: activity.id,
            userId,
            place: location,
            note: locationNote ?? null,
          });
          showToast(t("activities:report.successTitle"), "success");
        }
        setDraftLocation(null);
        setLocationNote(null);
        exitScreen();
      } catch (err) {
        console.log("[activity] save location failed", err);
        showToast(t("activities:toasts.locationSaveError"), "error");
      } finally {
        setSavingLocation(false);
      }
      return;
    }

    if (!hasLocationChanged(activity, location) && !needsConfirm) {
      if (!dateStatus?.needsConfirmation) {
        exitScreen();
      }
      return;
    }

    setSavingLocation(true);
    try {
      const updated = await saveActivityLocation(activity.id, location);
      dispatch(activityUpdated(updated));
      setDraftLocation(null);
      setLocationNote(null);
      showToast(t("activities:toasts.locationSaved"), "success");
      if (!dateStatus?.needsConfirmation) {
        exitScreen();
      }
    } catch (err) {
      console.log("[activity] save location failed", err);
      showToast(t("activities:toasts.locationSaveError"), "error");
    } finally {
      setSavingLocation(false);
    }
  }, [
    activity,
    dateStatus?.needsConfirmation,
    dispatch,
    draftLocation,
    exitScreen,
    isOwner,
    locationStatus?.needsConfirmation,
    showToast,
    t,
    userId,
  ]);

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
              isOwner={isOwner}
            />
          ) : null}

          {dateStatus ? (
            <ActivityDateEditorCard
              activity={activity}
              status={dateStatus}
              draftDate={draftDate}
              onChangeDate={handleDateSelected}
              onRequestChange={!isOwner ? () => setDateModalVisible(true) : undefined}
              onSave={handleSaveDate}
              saving={savingDate}
              isOwner={isOwner}
            />
          ) : null}
        </View>
      ) : null}

      <DateChangeModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onSubmit={(payload) => {
          handleDateSelected(payload.date, payload.note);
          setDateModalVisible(false);
        }}
        submitting={savingDate}
        initialValue={draftDate ?? officialDate ?? undefined}
        title={t("activities:details.suggestDateTitle")}
        subtitle={t("activities:details.suggestDateSubtitleForActivity", {
          title: activity?.title ?? t("common:labels.activity"),
        })}
      />
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
