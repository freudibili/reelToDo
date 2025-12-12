import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useAppDispatch, useAppSelector } from "@core/store/hook";
import type { PlaceDetails } from "@features/import/types";

import { ActivitiesService } from "../services/activitiesService";
import { activityPatched } from "../store/activitiesSlice";
import type { Activity } from "../types";

type DateSuggestionPayload = { date: Date; note: string | null };
type LocationSuggestionPayload = { place: PlaceDetails; note: string | null };

export const useActivitySuggestionActions = (activity: Activity | null) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSubmitting, setLocationSubmitting] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateSubmitting, setDateSubmitting] = useState(false);

  const openLocationModal = useCallback(() => {
    setLocationModalVisible(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setLocationModalVisible(false);
  }, []);

  const submitLocationSuggestion = useCallback(
    async (payload: LocationSuggestionPayload) => {
      if (!activity) return;
      setLocationSubmitting(true);
      try {
        await ActivitiesService.submitLocationSuggestion({
          activityId: activity.id,
          userId,
          place: payload.place,
          note: payload.note,
        });
        dispatch(
          activityPatched({
            id: activity.id,
            changes: {
              location_status: "suggested",
              needs_location_confirmation: true,
            },
          })
        );
        Alert.alert(
          t("activities:report.successTitle"),
          t("activities:report.successMessage")
        );
        closeLocationModal();
      } catch {
        Alert.alert(
          t("activities:report.errorTitle"),
          t("activities:report.errorMessage")
        );
      } finally {
        setLocationSubmitting(false);
      }
    },
    [activity, closeLocationModal, dispatch, t, userId]
  );

  const promptDateSuggestion = useCallback(() => {
    Alert.alert(
      t("activities:details.suggestDateTitle"),
      t("activities:details.suggestDateSubtitle"),
      [
        { text: t("common:buttons.cancel"), style: "cancel" },
        {
          text: t("activities:details.suggestDateConfirm"),
          onPress: () => setDateModalVisible(true),
        },
      ],
      { cancelable: true }
    );
  }, [t]);

  const closeDateModal = useCallback(() => {
    setDateModalVisible(false);
  }, []);

  const submitDateSuggestion = useCallback(
    async (payload: DateSuggestionPayload) => {
      if (!activity) return;
      setDateSubmitting(true);
      try {
        await ActivitiesService.submitDateSuggestion({
          activityId: activity.id,
          userId,
          suggestedDate: payload.date,
          note: payload.note,
        });
        Alert.alert(
          t("activities:details.suggestDateSuccessTitle"),
          t("activities:details.suggestDateSuccessMessage")
        );
        setDateModalVisible(false);
      } catch {
        Alert.alert(
          t("activities:details.suggestDateErrorTitle"),
          t("activities:details.suggestDateErrorMessage")
        );
      } finally {
        setDateSubmitting(false);
      }
    },
    [activity, t, userId]
  );

  return {
    locationModalVisible,
    locationSubmitting,
    openLocationModal,
    closeLocationModal,
    submitLocationSuggestion,
    dateModalVisible,
    dateSubmitting,
    promptDateSuggestion,
    closeDateModal,
    submitDateSuggestion,
  };
};
