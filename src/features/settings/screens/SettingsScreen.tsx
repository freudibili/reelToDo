import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import SettingsSection from "../components/SettingsSection";
import SettingsListItem from "../components/SettingsListItem";
import UserSettingsHeader from "../components/UserSettingsHeader";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { selectAuthUser } from "@features/auth/store/authSelectors";
import {
  loadSettings,
  hydrateProfileFromUser,
} from "@features/settings/store/settingsSlice";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";
import { signOut } from "@features/auth/store/authSlice";

const SettingsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
      profile.fullName ||
      (user?.user_metadata as { full_name?: string })?.full_name ||
      user?.email ||
      t("settings:placeholders.guest"),
    [profile.fullName, t, user?.email, user?.user_metadata]
  );

  const address = useMemo(
    () =>
      profile.address ||
      (user?.user_metadata as { address?: string })?.address ||
      t("settings:placeholders.address"),
    [profile.address, t, user?.user_metadata]
  );

  const email = profile.email || user?.email;

  const goTo = (path: string) => router.push(path as never);

  const handleLogout = () => {
    dispatch(signOut());
  };

  return (
    <AppScreen
      scrollable
      loading={loading}
      backgroundColor="#f1f5f9"
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
          title={t("settings:items.profile")}
          description={t("settings:items.profileSubtitle")}
          icon="account-edit"
          onPress={() => goTo("/settings/profile")}
        />
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

      <View style={styles.footer}>
        <SettingsListItem
          title={t("settings:actions.signOut")}
          icon="logout"
          onPress={handleLogout}
          tone="danger"
        />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
});

export default SettingsScreen;
