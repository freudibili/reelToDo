import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { Card, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import SettingsListItem from "../components/SettingsListItem";
import SettingsSection from "../components/SettingsSection";

const AboutScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const manifest = (Constants as unknown as { manifest?: Record<string, any> })
    .manifest;

  const version =
    Constants?.expoConfig?.version || manifest?.version || "dev";
  const buildNumber =
    Constants?.expoConfig?.extra?.buildNumber ||
    manifest?.extra?.buildNumber ||
    "-";

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:about.title")}
        subtitle={t("settings:about.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        <SettingsListItem
          title={t("settings:about.version")}
          description={version}
          icon="tag-outline"
        />
        <SettingsListItem
          title={t("settings:about.build")}
          description={String(buildNumber)}
          icon="database-outline"
        />
      </SettingsSection>

      <Card
        padding="lg"
        radius="lg"
        style={[
          styles.note,
          { backgroundColor: colors.mutedSurface, borderColor: colors.border },
        ]}
        variant="outlined"
      >
        <Text variant="headline" weight="700">
          {t("settings:about.roadmapTitle")}
        </Text>
        <Text variant="body" tone="muted">
          {t("settings:about.roadmap")}
        </Text>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  note: {
    marginTop: 10,
  },
});

export default AboutScreen;
