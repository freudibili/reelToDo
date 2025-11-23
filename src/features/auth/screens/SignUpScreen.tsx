import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import AuthButton from "../components/AuthButton";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";
import { clearError, requestMagicLink } from "../store/authSlice";

const SignUpScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("magicLink"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async () => {
    if (!email) return;
    dispatch(clearError());
    try {
      await dispatch(requestMagicLink({ email })).unwrap();
      router.push({
        pathname: "/auth/otp",
        params: { email, type: "magiclink" },
      });
    } catch {
      // handled by slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:signUp.title")}
      subtitle={t("auth:signUp.subtitle")}
      loading={status === "pending"}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthTextField
        label={t("common:fields.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="moi@email.com"
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
      />
      <AuthButton
        label={t("auth:signUp.submitOtp")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!email}
      />
      <SocialAuthButtons />
      <View style={styles.secondaryAction}>
        <Text style={styles.secondaryLabel}>{t("auth:signUp.hasAccount")}</Text>
        <AuthButton
          label={t("auth:signUp.cta")}
          variant="ghost"
          onPress={() => router.replace("/auth/signin")}
        />
      </View>
    </AuthLayout>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  error: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderColor: "#fecdd3",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  secondaryAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryLabel: {
    fontSize: 14,
    color: "#475569",
  },
});
