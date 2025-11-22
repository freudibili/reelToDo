import React from "react";
import { Switch } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "../store/settingsSelectors";
import {
  saveNotifications,
  setNotificationsLocally,
} from "../store/settingsSlice";

const NotificationsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const notifications = useAppSelector(settingsSelectors.notifications);

  const toggle = (key: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    dispatch(setNotificationsLocally(updated));
    dispatch(saveNotifications(updated));
  };

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:notifications.title")}
        subtitle={t("settings:notifications.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        <SettingsListItem
          title={t("settings:notifications.activityReminders")}
          description={t("settings:notifications.activityRemindersDesc")}
          icon="clock-outline"
          right={
            <Switch
              value={notifications.activityReminders}
              onValueChange={() => toggle("activityReminders")}
            />
          }
        />
        <SettingsListItem
          title={t("settings:notifications.tips")}
          description={t("settings:notifications.tipsDesc")}
          icon="lightbulb-on-outline"
          right={
            <Switch
              value={notifications.travelTips}
              onValueChange={() => toggle("travelTips")}
            />
          }
        />
        <SettingsListItem
          title={t("settings:notifications.product")}
          description={t("settings:notifications.productDesc")}
          icon="bullhorn-outline"
          right={
            <Switch
              value={notifications.productNews}
              onValueChange={() => toggle("productNews")}
            />
          }
        />
        <SettingsListItem
          title={t("settings:notifications.security")}
          description={t("settings:notifications.securityDesc")}
          icon="shield-outline"
          right={
            <Switch
              value={notifications.privacyAlerts}
              onValueChange={() => toggle("privacyAlerts")}
            />
          }
        />
      </SettingsSection>
    </AppScreen>
  );
};

export default NotificationsScreen;
