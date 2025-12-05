import React, { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import type { Activity } from "../utils/types";
import { getLocationActionIcon } from "../utils/locationActions";
import SuggestionPill from "./SuggestionPill";

type Props = {
  activity: Activity;
  onChangeLocation?: (activity: Activity) => void;
};

const LocationAssistButton: React.FC<Props> = ({
  activity,
  onChangeLocation,
}) => {
  const { t } = useTranslation();
  const icon = getLocationActionIcon(activity);

  const triggerChangeModal = useCallback(() => {
    if (onChangeLocation) {
      onChangeLocation(activity);
    }
  }, [activity, onChangeLocation]);

  const handlePress = useCallback(() => {
    if (!onChangeLocation) return;
    Alert.alert(
      t("activities:details.suggestLocationTitle"),
      t("activities:details.suggestLocationMessage"),
      [
        { text: t("common:buttons.cancel"), style: "cancel" },
        {
          text: t("activities:details.suggestLocationConfirm"),
          onPress: triggerChangeModal,
        },
      ],
      { cancelable: true }
    );
  }, [onChangeLocation, t, triggerChangeModal]);

  if (!onChangeLocation) return null;

  return <SuggestionPill onPress={handlePress} />;
};

export default LocationAssistButton;
