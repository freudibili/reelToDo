import React, { useMemo, useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import OtpInput from "../components/OtpInput";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectPendingEmail,
  selectPendingOtpType,
  selectRequiresPasswordChange,
} from "@features/auth/store/authSelectors";
import {
  clearError,
  verifyEmailOtp,
} from "@features/auth/store/authSlice";
import type { EmailOtpType } from "../services/authService";

type Params = { email?: string; type?: string };

const OtpVerificationScreen = () => {
  const { email: emailParam, type: typeParam } =
    useLocalSearchParams<Params>();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pendingEmail = useAppSelector(selectPendingEmail);
  const pendingType = useAppSelector(selectPendingOtpType);
  const requiresPasswordChange = useAppSelector(selectRequiresPasswordChange);
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("verifyOtp"));

  const [token, setToken] = useState("");

  const email = emailParam || pendingEmail || "";
  const type = useMemo<EmailOtpType>(
    () =>
      (typeParam as EmailOtpType) ||
      pendingType ||
      "email",
    [pendingType, typeParam]
  );

  const onSubmit = async () => {
    if (!email || !token) return;
    dispatch(clearError());
    try {
      await dispatch(
        verifyEmailOtp({ email, token: token.trim(), type })
      ).unwrap();

      if (type === "recovery" || requiresPasswordChange) {
        router.replace("/auth/reset-password");
      } else {
        router.replace("/");
      }
    } catch {
      // error handled in slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:otp.title")}
      subtitle={t("auth:otp.subtitle", { email })}
      loading={status === "pending"}
    >
      <Text style={styles.helperText}>{t("auth:otp.helper")}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <OtpInput value={token} onChange={setToken} />
      <AuthButton
        label={t("auth:otp.submit")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!email || token.length < 4}
      />
      <TouchableOpacity
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/auth")
        }
      >
        <Text style={styles.helper}>{t("auth:emailCheck.back")}</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  error: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderColor: "#fecdd3",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  helper: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  helperText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
});
