import React from "react";
import { Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import { useAppDispatch } from "@core/store/hook";
import { acknowledgeSessionExpiry } from "@features/auth/store/authSlice";

const SessionExpiredScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleRelog = () => {
    dispatch(acknowledgeSessionExpiry());
    router.replace("/auth/signin");
  };

  const handleBackHome = () => {
    dispatch(acknowledgeSessionExpiry());
    router.replace("/auth");
  };

  return (
    <AuthLayout
      title={t("auth:sessionExpired.title")}
      subtitle={t("auth:sessionExpired.subtitle")}
    >
      <Text style={styles.body}>{t("auth:sessionExpired.body")}</Text>
      <AuthButton label={t("auth:sessionExpired.relog")} onPress={handleRelog} />
      <AuthButton
        label={t("auth:sessionExpired.backToAuth")}
        variant="secondary"
        onPress={handleBackHome}
      />
    </AuthLayout>
  );
};

export default SessionExpiredScreen;

const styles = StyleSheet.create({
  body: {
    color: "#0f172a",
    fontSize: 15,
  },
});
