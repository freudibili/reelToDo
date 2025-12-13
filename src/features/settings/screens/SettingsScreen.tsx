import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { Card } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import { signOut } from "@features/auth/store/authSlice";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";
import {
  loadSettings,
  hydrateProfileFromUser,
} from "@features/settings/store/settingsSlice";
import {
  deriveProfileAddress,
  deriveProfileEmail,
  deriveProfileName,
} from "@features/settings/utils/profile";

import SettingsListItem from "../components/SettingsListItem";
import SettingsSection from "../components/SettingsSection";
import UserSettingsHeader from "../components/UserSettingsHeader";

const SettingsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const user = useAppSelector(selectAuthUser);
  const profile = useAppSelector(settingsSelectors.profile);
  const loading = useAppSelector(settingsSelectors.loading);
  const initialized = useAppSelector(settingsSelectors.initialized);

  useEffect(() => {
    dispatch(hydrateProfileFromUser(user));
    if (user?.id && !initialized) {
      dispatch(loadSettings({ userId: user.id, email: user.email }));
    }
  }, [dispatch, initialized, user]);

  const displayName = useMemo(
    () =>
      deriveProfileName(
        profile,
        user,
        t("settings:placeholders.guest")
      ),
    [profile, t, user]
  );

  const address = useMemo(
    () =>
      deriveProfileAddress(
        profile,
        user,
        t("settings:placeholders.address")
      ),
    [profile, t, user]
  );

  const email = useMemo(
    () => deriveProfileEmail(profile, user),
    [profile, user]
  );

  const goTo = (path: string) => router.push(path as never);

  const handleLogout = () => {
    dispatch(signOut());
  };

  return (
    <AppScreen
      scrollable
      loading={loading}
      backgroundColor={colors.background}
      withBottomInset
    >
      <ScreenHeader
        title={t("settings:title")}
        subtitle={t("settings:subtitle")}
      />

      <UserSettingsHeader
        name={displayName}
        email={email || undefined}
        address={address}
        onPress={() => goTo("/settings/profile")}
      />

      <SettingsSection title={t("settings:sections.account")}>
        <SettingsListItem
          title={t("settings:items.notifications")}
          description={t("settings:items.notificationsSubtitle")}
          icon="bell-ring"
          onPress={() => goTo("/settings/notifications")}
        />
        <SettingsListItem
          title={t("settings:items.preferences")}
          description={t("settings:items.preferencesSubtitle")}
          icon="tune-variant"
          onPress={() => goTo("/settings/preferences")}
        />
      </SettingsSection>

      <SettingsSection title={t("settings:sections.safety")}>
        <SettingsListItem
          title={t("settings:items.privacy")}
          description={t("settings:items.privacySubtitle")}
          icon="shield-check-outline"
          onPress={() => goTo("/settings/privacy")}
        />
        <SettingsListItem
          title={t("settings:items.support")}
          description={t("settings:items.supportSubtitle")}
          icon="lifebuoy"
          onPress={() => goTo("/settings/support")}
        />
        <SettingsListItem
          title={t("settings:items.about")}
          description={t("settings:items.aboutSubtitle")}
          icon="information-variant"
          onPress={() => goTo("/settings/about")}
        />
      </SettingsSection>

      <Card variant="outlined" padding="lg" radius="lg" style={styles.footer}>
        <SettingsListItem
          title={t("settings:actions.signOut")}
          icon="logout"
          onPress={handleLogout}
          tone="danger"
        />
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 12,
  },
});

export default SettingsScreen;
