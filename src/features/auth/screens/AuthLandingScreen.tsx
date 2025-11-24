import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import MagicLinkButton from "../components/MagicLinkButton";

const AuthLandingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t("auth:landing.catchphrase")}
      subtitle={t("auth:landing.helper")}
      tone="dark"
      backgroundColor="#040815"
    >
      <View style={styles.page}>
        <View style={styles.backgroundLayer} pointerEvents="none">
          <View style={[styles.circle, styles.circleA]} />
          <View style={[styles.circle, styles.circleB]} />
          <View style={[styles.circle, styles.circleC]} />
        </View>

        <View style={styles.actions}>
          <AuthButton
            label={t("auth:landing.signIn")}
            onPress={() => router.push("/auth/signin")}
          />
          <AuthButton
            label={t("auth:landing.signUp")}
            variant="secondary"
            onPress={() => router.push("/auth/signup")}
          />

          <View style={styles.altGroup}>
            <MagicLinkButton
              label={t("auth:landing.magicLink")}
              onPress={() => router.push("/auth/magic-link")}
            />
          </View>
        </View>
      </View>
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
    backgroundColor: "#2563eb",
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
    backgroundColor: "#22d3ee",
  },
  circleC: {
    width: 180,
    height: 180,
    top: 120,
    left: 40,
    backgroundColor: "#7c3aed",
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
