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
import { useAppTheme } from "@common/theme/appTheme";

const ForgotPasswordScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("passwordReset"));

  const onSubmit = async () => {
    if (!email) return;
    dispatch(clearError());
    try {
      await dispatch(requestPasswordReset({ email })).unwrap();
      setLinkSent(true);
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
          <Text style={[styles.link, { color: colors.primary }]}>
            {t("auth:signIn.title")}
          </Text>
        </TouchableOpacity>
      }
    >
      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: colors.danger,
              borderColor: colors.danger,
              backgroundColor:
                mode === "dark" ? colors.mutedSurface : colors.overlay,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
      {linkSent ? (
        <Text
          style={[
            styles.info,
            {
              color: colors.primary,
              borderColor: colors.border,
              backgroundColor:
                mode === "dark" ? colors.mutedSurface : colors.overlay,
            },
          ]}
        >
          {t("auth:emailCheck.resetMessage")}
        </Text>
      ) : null}
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
        <Text style={[styles.link, { color: colors.primary }]}>
          {t("auth:forgotPassword.haveCode")}
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  link: {
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  info: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});
