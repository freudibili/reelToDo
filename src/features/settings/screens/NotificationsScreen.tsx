import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";

import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { InlineMessage, Stack } from "@common/designSystem";
import { registerForPushNotifications, savePushToken } from "@common/services/pushNotifications";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { selectAuthUser } from "@features/auth/store/authSelectors";

import SettingsListItem from "../components/SettingsListItem";
import SettingsSection from "../components/SettingsSection";
import { settingsSelectors } from "../store/settingsSelectors";
import {
  saveNotifications,
  setNotificationsLocally,
} from "../store/settingsSlice";
import type { NotificationSettings } from "../utils/types";

const NotificationsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const userId = useAppSelector(selectAuthUser)?.id ?? null;
  const notifications = useAppSelector(settingsSelectors.notifications);
  const loading = useAppSelector(settingsSelectors.loading);
  const initializedRef = useRef(false);

  const ensurePushRegistration = useCallback(async () => {
    if (!userId) return;
    const token = await registerForPushNotifications({
      requestPermissions: true,
    });
    if (token) {
      await savePushToken(userId, token);
    }
  }, [userId]);

  const handleUpdate = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      if (value) {
        void ensurePushRegistration();
      }

      const next = { ...notifications, [key]: value };
      dispatch(setNotificationsLocally(next));
      dispatch(saveNotifications(next));
    },
    [dispatch, ensurePushRegistration, notifications]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (!userId || notifications.activityReminders) return;

    const bootstrap = async () => {
      const token = await registerForPushNotifications({
        requestPermissions: false,
      });
      if (!token) return;

      const next = { ...notifications, activityReminders: true };
      dispatch(setNotificationsLocally(next));
      dispatch(saveNotifications(next));
      await savePushToken(userId, token);
    };

    void bootstrap();
  }, [dispatch, notifications, userId]);

  const renderToggle = (
    key: keyof NotificationSettings,
    titleKey: string,
    descriptionKey: string,
    icon: string
  ) => (
    <SettingsListItem
      key={key}
      title={t(titleKey)}
      description={t(descriptionKey)}
      icon={icon}
      onPress={() => handleUpdate(key, !notifications[key])}
      showChevron={false}
      right={
        <Switch
          value={notifications[key]}
          onValueChange={(value) => handleUpdate(key, value)}
          color={colors.primary}
        />
      }
    />
  );

  return (
    <AppScreen scrollable loading={loading}>
      <ScreenHeader
        title={t("settings:notifications.title")}
        subtitle={t("settings:notifications.subtitle")}
        onBackPress={() => router.back()}
      />

      <Stack gap="md">
        <InlineMessage
          title={t("settings:notifications.unavailableTitle")}
          description={t("settings:notifications.unavailableDesc")}
          tone="neutral"
        />

        <SettingsSection>
          {renderToggle(
            "activityReminders",
            "settings:notifications.activityReminders",
            "settings:notifications.activityRemindersDesc",
            "bell-ring"
          )}
          {renderToggle(
            "travelTips",
            "settings:notifications.tips",
            "settings:notifications.tipsDesc",
            "lightbulb-on-outline"
          )}
          {renderToggle(
            "productNews",
            "settings:notifications.product",
            "settings:notifications.productDesc",
            "bullhorn-outline"
          )}
          {renderToggle(
            "privacyAlerts",
            "settings:notifications.security",
            "settings:notifications.securityDesc",
            "shield-check-outline"
          )}
        </SettingsSection>
      </Stack>
    </AppScreen>
  );
};

export default NotificationsScreen;
