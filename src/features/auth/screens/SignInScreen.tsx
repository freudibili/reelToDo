import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import AuthButton from "../components/AuthButton";
import MagicLinkButton from "../components/MagicLinkButton";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { clearError, signInWithPassword } from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";

const SignInScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error = useAppSelector(selectAuthError);
  const passwordStatus = useAppSelector(selectAuthRequestStatus("signIn"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const onPasswordSubmit = async () => {
    if (!email || !password) return;
    dispatch(clearError());
    try {
      await dispatch(signInWithPassword({ email, password })).unwrap();
      router.replace("/");
    } catch {
      // handled in slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:signIn.title")}
      subtitle={t("auth:signIn.subtitle")}
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
        label={t("auth:signIn.submit")}
        onPress={onPasswordSubmit}
        loading={passwordStatus === "pending"}
        disabled={!email || !password}
      />
      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.forgot}>{t("auth:signIn.forgot")}</Text>
      </TouchableOpacity>
      <MagicLinkButton
        label={t("auth:signIn.useMagicLink")}
        onPress={() =>
          router.push({
            pathname: "/auth/magic-link",
            params: email ? { email } : undefined,
          })
        }
      />
      <View style={styles.secondaryAction}>
        <Text style={styles.secondaryLabel}>
          {t("auth:signIn.noAccount")}
        </Text>
        <AuthButton
          label={t("auth:signUp.title")}
          variant="ghost"
          onPress={() => router.replace("/auth/signup")}
        />
      </View>
    </AuthLayout>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  error: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderColor: "#fecdd3",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  forgot: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
    alignSelf: "flex-start",
    marginTop: -2,
    marginBottom: 4,
  },
  secondaryAction: {
    alignSelf: "flex-start",
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryLabel: {
    fontSize: 14,
    color: "#475569",
  },
});
