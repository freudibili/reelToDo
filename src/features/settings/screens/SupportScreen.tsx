import React from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";
import { openSupportMail } from "../utils/support";

const SupportScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const errorTitle = t("settings:support.errorTitle");
  const errorMessage = t("settings:support.error");

  const supportOptions = [
    {
      key: "chat",
      title: t("settings:support.chat"),
      description: t("settings:support.chatDesc"),
      subject: t("settings:support.subjects.chat"),
      icon: "message-text-outline",
    },
    {
      key: "issue",
      title: t("settings:support.issue"),
      description: t("settings:support.issueDesc"),
      subject: t("settings:support.subjects.issue"),
      icon: "alert-circle-outline",
    },
    {
      key: "feedback",
      title: t("settings:support.feedback"),
      description: t("settings:support.feedbackDesc"),
      subject: t("settings:support.subjects.feedback"),
      icon: "star-outline",
    },
  ] as const;

  const handleOpenSupport = (subject: string) => {
    void openSupportMail({
      subject,
      errorTitle,
      errorMessage,
    });
  };

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:support.title")}
        subtitle={t("settings:support.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        {supportOptions.map((option) => (
          <SettingsListItem
            key={option.key}
            title={option.title}
            description={option.description}
            icon={option.icon}
            onPress={() => handleOpenSupport(option.subject)}
          />
        ))}
      </SettingsSection>
    </AppScreen>
  );
};

export default SupportScreen;
