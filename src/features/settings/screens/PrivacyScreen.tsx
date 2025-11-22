import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";

const PrivacyScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

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

      <View style={styles.note}>
        <Text style={styles.noteTitle}>{t("settings:privacy.noteTitle")}</Text>
        <Text style={styles.noteText}>{t("settings:privacy.noteText")}</Text>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  note: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    marginTop: 10,
  },
  noteTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  noteText: {
    color: "#e2e8f0",
    lineHeight: 20,
  },
});

export default PrivacyScreen;
