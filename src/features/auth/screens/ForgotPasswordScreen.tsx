import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import { InlineMessage } from "@common/designSystem";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  requestPasswordReset,
  clearError,
} from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
} from "@features/auth/store/authSelectors";
import AuthButton from "../components/AuthButton";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";

const ForgotPasswordScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("passwordReset"));

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
    }, [dispatch])
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth");
    }
  }, [router]);

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
      showBackButton
      onBackPress={handleBack}
    >
      {error ? (
        <InlineMessage
          tone="danger"
          description={error}
          icon="alert-circle-outline"
        />
      ) : null}
      {linkSent ? (
        <InlineMessage
          tone="info"
          description={t("auth:emailCheck.resetMessage")}
          icon="email-send-outline"
        />
      ) : null}
      <AuthTextField
        label={t("common:fields.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("common:placeholders.email")}
        value={email}
        onChangeText={setEmail}
      />
      <AuthButton
        label={t("auth:forgotPassword.submit")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!email}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
