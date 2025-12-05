import React from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";

const NotificationsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:notifications.title")}
        subtitle={t("settings:notifications.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        <SettingsListItem
          title={t("settings:notifications.unavailableTitle")}
          description={t("settings:notifications.unavailableDesc")}
          icon="bell-off-outline"
        />
      </SettingsSection>
    </AppScreen>
  );
};

export default NotificationsScreen;
