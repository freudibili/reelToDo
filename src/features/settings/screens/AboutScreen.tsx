import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";

const AboutScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

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

      <View style={styles.note}>
        <Text style={styles.noteTitle}>{t("settings:about.roadmapTitle")}</Text>
        <Text style={styles.noteText}>{t("settings:about.roadmap")}</Text>
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

export default AboutScreen;
