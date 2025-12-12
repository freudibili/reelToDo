import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-paper";

import { Divider, InlineMessage, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";
import { clearError, signUpWithPassword } from "../store/authSlice";
import AuthButton from "../components/AuthButton";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";

const SignUpScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const error = useAppSelector(selectAuthError);
  const passwordStatus = useAppSelector(selectAuthRequestStatus("signUp"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
      setVerificationSent(false);
    }, [dispatch])
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const onSubmitPassword = async () => {
    if (!email || !password) return;
    setVerificationSent(false);
    dispatch(clearError());
    try {
      const result = await dispatch(
        signUpWithPassword({ email, password })
      ).unwrap();

      if (!result.session) {
        setVerificationSent(true);
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
      {verificationSent ? (
        <InlineMessage
          tone="info"
          description={t("auth:emailCheck.magicMessage")}
          icon="email-send-outline"
        />
      ) : null}
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
      <Stack direction="row" align="center" gap="sm" style={styles.dividerRow}>
        <Divider style={styles.dividerLine} />
        <Text variant="caption" tone="muted" weight="700">
          {t("auth:or")}
        </Text>
        <Divider style={styles.dividerLine} />
      </Stack>
      <Stack direction="row" justify="space-between" align="center">
        <Text
          variant="body"
          tone="primary"
          weight="700"
          onPress={() => router.replace("/auth/signin")}
        >
          {t("auth:signUp.cta")}
        </Text>
        <Stack direction="row" align="center" gap="xs">
          <Icon source="star-four-points" size={16} color={colors.primary} />
          <Text
            variant="body"
            tone="primary"
            weight="700"
            onPress={() =>
              router.push({
                pathname: "/auth/magic-link",
                params: email ? { email } : undefined,
              })
            }
          >
            {t("auth:signUp.useMagicLink")}
          </Text>
        </Stack>
      </Stack>
    </AuthLayout>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  secondaryAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dividerRow: {
    marginTop: 12,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
  },
});
