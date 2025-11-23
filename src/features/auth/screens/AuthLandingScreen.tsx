import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";

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
  heroContent: {
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  icon: {
    width: 26,
    height: 26,
  },
  badgeText: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  catchphrase: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  helper: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  helperAboveCtas: {
    marginTop: 6,
    marginBottom: 2,
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
});
