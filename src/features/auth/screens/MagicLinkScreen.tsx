import React, { useCallback, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import MagicLinkButton from "../components/MagicLinkButton";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  requestMagicLink,
  clearError,
} from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
} from "@features/auth/store/authSelectors";
import { useAppTheme } from "@common/theme/appTheme";

const MagicLinkScreen = () => {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const [email, setEmail] = useState(emailParam || "");
  const [linkSent, setLinkSent] = useState(false);

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("magicLink"));

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
      setLinkSent(false);
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
      await dispatch(requestMagicLink({ email })).unwrap();
      setLinkSent(true);
    } catch {
      // error handled by slice
    }
  };

  return (
    <AuthLayout
      title={t("auth:magicLink.title")}
      subtitle={t("auth:magicLink.subtitle")}
      loading={status === "pending"}
      withCard={false}
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
          {t("auth:emailCheck.magicMessage")}
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
      <MagicLinkButton
        label={t("auth:magicLink.submit")}
        onPress={onSubmit}
        loading={status === "pending"}
        disabled={!email}
      />
    </AuthLayout>
  );
};

export default MagicLinkScreen;

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
