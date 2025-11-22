import React from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";

const SupportScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const openMail = (subject: string) => {
    const uri = `mailto:support@reeltodo.app?subject=${encodeURIComponent(
      subject
    )}`;
    Linking.openURL(uri).catch(() =>
      Alert.alert(t("settings:support.errorTitle"), t("settings:support.error"))
    );
  };

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:support.title")}
        subtitle={t("settings:support.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        <SettingsListItem
          title={t("settings:support.chat")}
          description={t("settings:support.chatDesc")}
          icon="message-text-outline"
          onPress={() => openMail("ReelToDo Support")}
        />
        <SettingsListItem
          title={t("settings:support.issue")}
          description={t("settings:support.issueDesc")}
          icon="alert-circle-outline"
          onPress={() => openMail("Issue Report")}
        />
        <SettingsListItem
          title={t("settings:support.feedback")}
          description={t("settings:support.feedbackDesc")}
          icon="star-outline"
          onPress={() => openMail("Feedback")}
        />
      </SettingsSection>
    </AppScreen>
  );
};

export default SupportScreen;
