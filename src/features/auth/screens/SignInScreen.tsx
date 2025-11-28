import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-paper";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import AuthButton from "../components/AuthButton";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { clearError, signInWithPassword } from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
  selectIsAuthenticated,
} from "@features/auth/store/authSelectors";
import { useAppTheme } from "@common/theme/appTheme";

const SignInScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error = useAppSelector(selectAuthError);
  const passwordStatus = useAppSelector(selectAuthRequestStatus("signIn"));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
      showBackButton
      onBackPress={handleBack}
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
        <Text style={[styles.forgot, { color: colors.primary }]}>
          {t("auth:signIn.forgot")}
        </Text>
      </TouchableOpacity>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.secondaryText }]}>
          {t("auth:or")}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>
      <View style={styles.altRow}>
        <TouchableOpacity onPress={() => router.replace("/auth/signup")}>
          <Text style={[styles.altLink, { color: colors.primary }]}>
            {t("auth:signUp.title")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/auth/magic-link",
              params: email ? { email } : undefined,
            })
          }
        >
          <View style={styles.magicLinkRow}>
            <Icon
              source="star-four-points"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.altLink, { color: colors.primary }]}>
              {t("auth:signIn.useMagicLink")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  error: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  forgot: {
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  altRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -2,
  },
  altLink: {
    fontWeight: "700",
    fontSize: 14,
  },
  magicLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
