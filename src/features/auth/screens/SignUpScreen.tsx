import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import AuthButton from "../components/AuthButton";
import MagicLinkButton from "../components/MagicLinkButton";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";
import { clearError, signUpWithPassword } from "../store/authSlice";

const SignUpScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error = useAppSelector(selectAuthError);
  const passwordStatus = useAppSelector(selectAuthRequestStatus("signUp"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const onSubmitPassword = async () => {
    if (!email || !password) return;
    dispatch(clearError());
    try {
      const result = await dispatch(
        signUpWithPassword({ email, password })
      ).unwrap();

      if (!result.session) {
        router.push({
          pathname: "/auth/otp",
          params: { email, type: "signup" },
        });
      } else {
        router.replace("/");
      }
    } catch {
      // handled by slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:signUp.title")}
      subtitle={t("auth:signUp.subtitle")}
      loading={passwordStatus === "pending"}
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
      <AuthTextField
        label={t("common:fields.password")}
        secureTextEntry
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
      />
      <AuthButton
        label={t("auth:signUp.submit")}
        onPress={onSubmitPassword}
        loading={passwordStatus === "pending"}
        disabled={!email || !password}
      />
      <MagicLinkButton
        label={t("auth:signUp.useMagicLink")}
        onPress={() =>
          router.push({
            pathname: "/auth/magic-link",
            params: email ? { email } : undefined,
          })
        }
      />
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
