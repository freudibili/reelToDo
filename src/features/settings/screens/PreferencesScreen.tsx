import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import OptionPill from "../components/OptionPill";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "../store/settingsSelectors";
import {
  savePreferences,
  setPreferencesLocally,
} from "../store/settingsSlice";
import {
  distanceOptions,
  languageOptions,
  themeOptions,
} from "../utils/constants";
import type { PreferenceSettings } from "../utils/types";

const PreferencesScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const preferences = useAppSelector(settingsSelectors.preferences);

  const updatePreferences = <K extends keyof PreferenceSettings>(
    key: K,
    value: PreferenceSettings[K]
  ) => {
    const next = { ...preferences, [key]: value };
    dispatch(setPreferencesLocally(next));
    dispatch(savePreferences(next));
  };

  return (
    <AppScreen scrollable>
      <ScreenHeader
        title={t("settings:preferences.title")}
        subtitle={t("settings:preferences.subtitle")}
        onBackPress={() => router.back()}
      />

      <SettingsSection title={t("settings:preferences.language.title")}>
        <View style={styles.row}>
          {languageOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.language === option.value}
              onPress={() => updatePreferences("language", option.value)}
            />
          ))}
        </View>
      </SettingsSection>

      <SettingsSection title={t("settings:preferences.distance.title")}>
        <View style={styles.row}>
          {distanceOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.distanceUnit === option.value}
              onPress={() => updatePreferences("distanceUnit", option.value)}
            />
          ))}
        </View>
      </SettingsSection>

      <SettingsSection title={t("settings:preferences.theme.title")}>
        <View style={styles.row}>
          {themeOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.theme === option.value}
              onPress={() => updatePreferences("theme", option.value)}
            />
          ))}
        </View>
      </SettingsSection>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
});

export default PreferencesScreen;
