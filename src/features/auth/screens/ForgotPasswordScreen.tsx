import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import AuthButton from "../components/AuthButton";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  requestPasswordReset,
  clearError,
} from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
} from "@features/auth/store/authSelectors";

const ForgotPasswordScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("passwordReset"));

  const onSubmit = async () => {
    if (!email) return;
    dispatch(clearError());
    try {
      await dispatch(requestPasswordReset({ email })).unwrap();
      router.push({
        pathname: "/auth/otp",
        params: { email, type: "recovery" },
      });
    } catch {
      // error handled in slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:forgotPassword.title")}
      subtitle={t("auth:forgotPassword.subtitle")}
      loading={status === "pending"}
      footer={
        <TouchableOpacity onPress={() => router.replace("/auth/signin")}>
          <Text style={styles.link}>{t("auth:signIn.title")}</Text>
        </TouchableOpacity>
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthTextField
        label={t("common:fields.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="moi@email.com"
        value={email}
        onChangeText={setEmail}
      />
      <AuthButton
        label={t("auth:forgotPassword.submit")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!email}
      />
      <TouchableOpacity onPress={() => router.push("/auth/otp")}>
        <Text style={styles.link}>{t("auth:forgotPassword.haveCode")}</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  link: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderColor: "#fecdd3",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});
