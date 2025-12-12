import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { InlineMessage } from "@common/designSystem";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
  selectRequiresPasswordChange,
} from "@features/auth/store/authSelectors";
import { clearError, updatePassword } from "@features/auth/store/authSlice";
import AuthButton from "../components/AuthButton";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";

const ResetPasswordScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const requiresPasswordChange = useAppSelector(selectRequiresPasswordChange);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthRequestStatus("updatePassword"));
  const error = useAppSelector(selectAuthError);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!requiresPasswordChange && isAuthenticated) {
      router.replace("/");
    } else if (!requiresPasswordChange && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [requiresPasswordChange, isAuthenticated, router]);

  const onSubmit = async () => {
    if (password.length < 8) {
      setLocalError(t("auth:resetPassword.minLength"));
      return;
    }
    if (password !== confirm) {
      setLocalError(t("auth:resetPassword.mismatch"));
      return;
    }
    setLocalError(null);
    dispatch(clearError());
    try {
      await dispatch(updatePassword({ password })).unwrap();
      router.replace("/");
    } catch {
      // error handled by slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:resetPassword.title")}
      subtitle={t("auth:resetPassword.subtitle")}
      loading={status === "pending"}
    >
      {error ? (
        <InlineMessage
          tone="danger"
          description={error}
          icon="alert-circle-outline"
        />
      ) : null}
      {localError ? (
        <InlineMessage
          tone="danger"
          description={localError}
          icon="alert-circle-outline"
        />
      ) : null}
      <AuthTextField
        label={t("auth:resetPassword.password")}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextField
        label={t("auth:resetPassword.confirm")}
        placeholder="••••••••"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      <AuthButton
        label={t("auth:resetPassword.submit")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!password || !confirm}
      />
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
