import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { showToast as showToastAction } from "@common/store/appSlice";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import { useActivityDetails } from "@features/activities/hooks/useActivityDetails";
import {
  activityUpdated,
  cancelActivity,
  deleteActivity,
} from "@features/activities/store/activitiesSlice";
import type { PlaceDetails } from "@features/import/types";

import { ActivitiesService } from "../services/activitiesService";
import type { ActivityModeDate } from "../types";
import {
  getFallbackLabels,
  getOfficialDateInfo,
  isActivityOwner,
  resolveDateLabel,
  resolveLocationLabel,
  shouldShowDateSection,
} from "../utils/activityScreen";
import {
  hasDateChanged,
  resolveDateStatus,
  saveActivityDate,
  resolveDateAction,
} from "../utils/dateEditor";
import {
  derivePlaceFromActivity,
  resolveLocationStatus,
  hasLocationChanged,
  saveActivityLocation,
  resolveLocationAction,
} from "../utils/locationEditor";

type ControllerOptions = {
  activityId: string | null;
  onExit: () => void;
  onDeleted: () => void;
};

export const useActivityScreenController = ({
  activityId,
  onExit,
  onDeleted,
}: ControllerOptions) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const user = useAppSelector(selectAuthUser);
  const userId = user?.id ?? null;
  const { activity, loading } = useActivityDetails(activityId);
  const [draftLocation, setDraftLocation] = useState<PlaceDetails | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [dateNote, setDateNote] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      dispatch(showToastAction({ message, type }));
    },
    [dispatch]
  );

  useEffect(() => {
    setDraftLocation(null);
    setLocationNote(null);
    setDraftDate(null);
    setDateNote(null);
  }, [activity?.id]);

  const fallbackLabels = useMemo(() => getFallbackLabels(t), [t]);
  const { value: officialDateValue, date: officialDate } = useMemo(
    () => getOfficialDateInfo(activity ?? null),
    [activity]
  );
  const isOwner = useMemo(
    () => isActivityOwner(activity ?? null, userId),
    [activity, userId]
  );
  const locationLabel = useMemo(
    () =>
      resolveLocationLabel({
        activity: activity ?? null,
        draftLocation,
        fallbackLabel: fallbackLabels.location,
      }),
    [activity, draftLocation, fallbackLabels.location]
  );
  const dateStatus = useMemo(
    () => (activity ? resolveDateStatus(activity, t) : null),
    [activity, t]
  );
  const showDate = useMemo(
    () => shouldShowDateSection(activity ?? null, dateStatus),
    [activity, dateStatus]
  );
  const dateLabel = useMemo(
    () =>
      showDate
        ? resolveDateLabel({
            activity: activity ?? null,
            draftDate,
            fallbackLabel: fallbackLabels.date,
            officialDate,
            officialValue: officialDateValue,
          })
        : null,
    [
      activity,
      draftDate,
      fallbackLabels.date,
      officialDate,
      officialDateValue,
      showDate,
    ]
  );
  const locationStatus = useMemo(
    () => (activity ? resolveLocationStatus(activity, t, { isOwner }) : null),
    [activity, isOwner, t]
  );
  const locationAction = useMemo(
    () =>
      activity
        ? resolveLocationAction({ activity, isOwner, draftLocation })
        : "continue",
    [activity, draftLocation, isOwner]
  );
  const dateAction = useMemo(
    () =>
      activity
        ? resolveDateAction({ activity, isOwner, draftDate })
        : "continue",
    [activity, draftDate, isOwner]
  );
  const needsLocationAction =
    Boolean(locationStatus) && locationAction !== "continue";
  const needsDateAction = Boolean(dateStatus) && dateAction !== "continue";
  const footerPrimaryMode = needsLocationAction
    ? "location"
    : needsDateAction
      ? "date"
      : "continue";
  const footerPrimaryLabel =
    footerPrimaryMode === "continue"
      ? t("common:buttons.continue")
      : t("common:buttons.confirm");
  const footerPrimaryDisabled =
    footerPrimaryMode === "location"
      ? savingLocation || deletingActivity
      : footerPrimaryMode === "date"
        ? savingDate || deletingActivity
        : deletingActivity || savingLocation || savingDate || loading;
  const footerPrimaryLoading =
    footerPrimaryMode === "location"
      ? savingLocation
      : footerPrimaryMode === "date"
        ? savingDate
        : false;
  const headerTitle = activity?.title ?? t("common:labels.activity");

  const isProcessing =
    (activity?.processing_status ?? "complete") === "processing";
  const isFailed = activity?.processing_status === "failed";

  const handleLocationSelected = useCallback(
    (payload: { place: PlaceDetails; note: string | null }) => {
      setDraftLocation(payload.place);
      setLocationNote(payload.note);
    },
    []
  );

  const handleDateSelected = useCallback((date: Date, note?: string | null) => {
    setDraftDate(date);
    if (note !== undefined) {
      setDateNote(note);
    }
  }, []);

  const handleSaveDate = useCallback(async () => {
    if (!activity?.id) return;
    if (dateAction === "continue") {
      onExit();
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
        onExit();
      }
      return;
    }

    setSavingDate(true);
    try {
      if (!isOwner) {
        if (dateAction !== "suggest") {
          onExit();
          return;
        }
        await ActivitiesService.submitDateSuggestion({
          activityId: activity.id,
          userId,
          suggestedDate: dateToSave,
          note: dateNote ?? null,
        });
        setDraftDate(null);
        setDateNote(null);
        onExit();
        return;
      }

      const updated = await saveActivityDate(activity.id, dateToSave);
      dispatch(activityUpdated(updated));
      setDraftDate(null);
      setDateNote(null);
      if (!locationStatus?.needsConfirmation) {
        onExit();
      }
    } catch (err) {
      console.log("[activity] save date failed", err);
      showToast(t("activities:toasts.dateSaveError"), "error");
    } finally {
      setSavingDate(false);
    }
  }, [
    activity,
    dateAction,
    dateStatus?.needsConfirmation,
    dispatch,
    draftDate,
    isOwner,
    locationStatus?.needsConfirmation,
    officialDate,
    onExit,
    showToast,
    t,
    userId,
    dateNote,
  ]);

  const handleSaveLocation = useCallback(async () => {
    if (!activity?.id) return;
    if (locationAction === "continue") {
      onExit();
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
        onExit();
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
        }
        setDraftLocation(null);
        setLocationNote(null);
        onExit();
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
        onExit();
      }
      return;
    }

    setSavingLocation(true);
    try {
      const updated = await saveActivityLocation(activity.id, location);
      dispatch(activityUpdated(updated));
      setDraftLocation(null);
      setLocationNote(null);
      if (!dateStatus?.needsConfirmation) {
        onExit();
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
    isOwner,
    locationAction,
    locationStatus?.needsConfirmation,
    locationNote,
    onExit,
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
    const ownerOwned = activity.user_id === userId;
    setDeletingActivity(true);
    const thunk = ownerOwned ? deleteActivity : cancelActivity;
    dispatch(thunk(activity.id))
      .unwrap()
      .then(() => {
        onDeleted();
      })
      .catch((err) => {
        console.log("[activity] delete failed", err);
        showToast(t("activities:toasts.deleteError"), "error");
      })
      .finally(() => {
        setDeletingActivity(false);
      });
  }, [
    activity?.id,
    activity?.user_id,
    deletingActivity,
    dispatch,
    onDeleted,
    showToast,
    t,
    userId,
  ]);

  const handleFooterPrimary = useCallback(() => {
    if (needsLocationAction) {
      void handleSaveLocation();
      return;
    }
    if (needsDateAction) {
      void handleSaveDate();
      return;
    }
    onExit();
  }, [
    handleSaveDate,
    handleSaveLocation,
    needsDateAction,
    needsLocationAction,
    onExit,
  ]);

  const footerProps = useMemo(
    () => ({
      onCancel: handleDeleteActivity,
      onPrimary: handleFooterPrimary,
      cancelLabel: deletingActivity
        ? `${t("common:buttons.delete")}…`
        : t("activities:editor.cancelActivity"),
      primaryLabel: footerPrimaryLabel,
      cancelLoading: deletingActivity,
      cancelDisabled: savingLocation || savingDate,
      primaryDisabled: footerPrimaryDisabled,
      primaryLoading: footerPrimaryLoading,
    }),
    [
      deletingActivity,
      footerPrimaryDisabled,
      footerPrimaryLabel,
      footerPrimaryLoading,
      handleDeleteActivity,
      handleFooterPrimary,
      savingDate,
      savingLocation,
      t,
    ]
  );

  const openDateModal = useCallback(() => setDateModalVisible(true), []);
  const closeDateModal = useCallback(() => setDateModalVisible(false), []);
  const handleDateModalSubmit = useCallback(
    (payload: { date: Date; note: string | null }) => {
      handleDateSelected(payload.date, payload.note);
      closeDateModal();
    },
    [closeDateModal, handleDateSelected]
  );
  const dateModalTitle = isOwner
    ? t("activities:editor.updateDateTitle")
    : t("activities:details.suggestDateTitle");
  const dateModalSubtitle = isOwner
    ? t("activities:editor.updateDateSubtitle")
    : t("activities:details.suggestDateSubtitleForActivity", {
        title: activity?.title ?? t("common:labels.activity"),
      });
  const dateModalMode: ActivityModeDate = isOwner ? "update" : "suggest";

  return {
    activity,
    loading,
    headerTitle,
    isProcessing,
    isFailed,
    locationLabel,
    dateLabel,
    showDate,
    locationStatus,
    dateStatus,
    locationAction,
    dateAction,
    draftLocation,
    draftDate,
    handleLocationSelected,
    handleDateSelected,
    handleSaveLocation,
    handleSaveDate,
    handleDeleteActivity,
    savingLocation,
    savingDate,
    deletingActivity,
    isOwner,
    officialDate,
    footerProps,
    openDateModal,
    closeDateModal,
    dateModalVisible,
    dateModalMode,
    dateModalTitle,
    dateModalSubtitle,
    dateModalInitialValue: draftDate ?? officialDate ?? undefined,
    handleDateModalSubmit,
  };
};
