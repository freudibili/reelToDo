import React from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Stack } from "@common/designSystem";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import SettingsSection from "../components/SettingsSection";
import OptionPill from "../components/OptionPill";
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
        <Stack direction="row" wrap gap="sm" style={styles.row}>
          {languageOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.language === option.value}
              onPress={() => updatePreferences("language", option.value)}
            />
          ))}
        </Stack>
      </SettingsSection>

      <SettingsSection title={t("settings:preferences.distance.title")}>
        <Stack direction="row" wrap gap="sm" style={styles.row}>
          {distanceOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.distanceUnit === option.value}
              onPress={() => updatePreferences("distanceUnit", option.value)}
            />
          ))}
        </Stack>
      </SettingsSection>

      <SettingsSection title={t("settings:preferences.theme.title")}>
        <Stack direction="row" wrap gap="sm" style={styles.row}>
          {themeOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={t(option.labelKey)}
              selected={preferences.theme === option.value}
              onPress={() => updatePreferences("theme", option.value)}
            />
          ))}
        </Stack>
      </SettingsSection>
    </AppScreen>
  );
};

const styles = {
  row: {
    padding: 12,
  },
} satisfies Record<string, object>;

export default PreferencesScreen;
