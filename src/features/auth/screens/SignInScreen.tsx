import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import { Divider, InlineMessage, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";
import { clearError, signInWithPassword } from "@features/auth/store/authSlice";

import AuthButton from "../components/AuthButton";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import {
  useAuthBackNavigation,
  useRedirectIfAuthenticated,
} from "../utils/navigation";

const SignInScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error = useAppSelector(selectAuthError);
  const passwordStatus = useAppSelector(selectAuthRequestStatus("signIn"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const handleBack = useAuthBackNavigation(router);

  useRedirectIfAuthenticated(isAuthenticated, router);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
    }, [dispatch])
  );

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
      <AuthTextField
        label={t("common:fields.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("common:placeholders.email")}
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
      />
      <AuthTextField
        label={t("common:fields.password")}
        secureTextEntry
        placeholder={t("common:placeholders.password")}
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
      <Text
        variant="bodySmall"
        tone="primary"
        weight="700"
        onPress={() => router.push("/auth/forgot-password")}
        style={styles.link}
      >
        {t("auth:signIn.forgot")}
      </Text>

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
          onPress={() => router.replace("/auth/signup")}
        >
          {t("auth:signUp.title")}
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
            {t("auth:signIn.useMagicLink")}
          </Text>
        </Stack>
      </Stack>
    </AuthLayout>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  link: {
    alignSelf: "flex-start",
    marginTop: -2,
    marginBottom: 4,
  },
  dividerRow: {
    marginTop: 12,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
  },
});
