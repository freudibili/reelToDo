import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Box, Stack } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import AuthButton from "../components/AuthButton";
import AuthLayout from "../components/AuthLayout";
import MagicLinkButton from "../components/MagicLinkButton";

const AuthLandingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { colors } = useAppTheme();

  return (
    <AuthLayout
      title={t("auth:landing.catchphrase")}
      subtitle={t("auth:landing.helper")}
      tone="dark"
      backgroundColor={colors.background}
    >
      <Box style={styles.page}>
        <Box style={styles.backgroundLayer} pointerEvents="none">
          <Box
            style={[
              styles.circle,
              styles.circleA,
              { backgroundColor: colors.gradientPrimaryStart },
            ]}
          />
          <Box
            style={[
              styles.circle,
              styles.circleB,
              { backgroundColor: colors.info },
            ]}
          />
          <Box
            style={[
              styles.circle,
              styles.circleC,
              { backgroundColor: colors.gradientPrimaryEnd, opacity: 0.08 },
            ]}
          />
        </Box>

        <Stack gap="md" style={styles.actions}>
          <AuthButton
            label={t("auth:landing.signIn")}
            onPress={() => router.push("/auth/signin")}
          />
          <AuthButton
            label={t("auth:landing.signUp")}
            variant="secondary"
            onPress={() => router.push("/auth/signup")}
          />

          <Stack gap="sm" style={styles.altGroup}>
            <MagicLinkButton
              label={t("auth:landing.magicLink")}
              onPress={() => router.push("/auth/magic-link")}
            />
          </Stack>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default AuthLandingScreen;

const styles = StyleSheet.create({
  page: {
    position: "relative",
    gap: 14,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.12,
  },
  circleA: {
    width: 320,
    height: 320,
    top: -120,
    right: -120,
  },
  circleB: {
    width: 240,
    height: 240,
    bottom: -120,
    left: -60,
  },
  circleC: {
    width: 180,
    height: 180,
    top: 120,
    left: 40,
    opacity: 0.08,
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  altGroup: {
    marginTop: 6,
    gap: 8,
  },
});
