import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { Card, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import SettingsListItem from "../components/SettingsListItem";
import SettingsSection from "../components/SettingsSection";

const PrivacyScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:privacy.title")}
        subtitle={t("settings:privacy.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection>
        <SettingsListItem
          title={t("settings:privacy.dataControl")}
          description={t("settings:privacy.dataControlDesc")}
          icon="shield-lock-outline"
        />
        <SettingsListItem
          title={t("settings:privacy.location")}
          description={t("settings:privacy.locationDesc")}
          icon="map-marker-radius-outline"
        />
        <SettingsListItem
          title={t("settings:privacy.backup")}
          description={t("settings:privacy.backupDesc")}
          icon="cloud-sync-outline"
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
          {t("settings:privacy.noteTitle")}
        </Text>
        <Text variant="body" tone="muted">
          {t("settings:privacy.noteText")}
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

export default PrivacyScreen;
