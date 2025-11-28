import React, { useCallback } from "react";
import { Alert, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@common/theme/appTheme";
import type { Activity } from "../utils/types";
import { getLocationActionIcon, shouldForceLocationEdit } from "../utils/locationActions";

type Props = {
  activity: Activity;
  onChangeLocation?: (activity: Activity) => void;
};

const LocationAssistButton: React.FC<Props> = ({ activity, onChangeLocation }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const forceEdit = shouldForceLocationEdit(activity);
  const icon = getLocationActionIcon(activity);

  const triggerChangeModal = useCallback(() => {
    if (onChangeLocation) {
      onChangeLocation(activity);
    }
  }, [activity, onChangeLocation]);

  const handlePress = useCallback(() => {
    if (!onChangeLocation) return;
    if (forceEdit) {
      triggerChangeModal();
      return;
    }

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
  }, [forceEdit, onChangeLocation, t, triggerChangeModal]);

  if (!onChangeLocation) return null;

  return (
    <IconButton
      mode="contained"
      icon={icon}
      size={18}
      onPress={handlePress}
      containerColor={colors.accent}
      iconColor="#ffffff"
      style={styles.iconButton}
      rippleColor={colors.overlay}
    />
  );
};

export default LocationAssistButton;

const styles = StyleSheet.create({
  iconButton: {
    margin: 0,
  },
});
