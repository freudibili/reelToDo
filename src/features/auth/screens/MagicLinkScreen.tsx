import React, { useCallback, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import { InlineMessage } from "@common/designSystem";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { requestMagicLink, clearError } from "@features/auth/store/authSlice";
import {
  selectAuthError,
  selectAuthRequestStatus,
} from "@features/auth/store/authSelectors";
import { useAuthBackNavigation } from "../utils/navigation";
import AuthLayout from "../components/AuthLayout";
import AuthTextField from "../components/AuthTextField";
import MagicLinkButton from "../components/MagicLinkButton";

const MagicLinkScreen = () => {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState(emailParam || "");
  const [linkSent, setLinkSent] = useState(false);

  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthRequestStatus("magicLink"));
  const handleBack = useAuthBackNavigation(router);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
      setLinkSent(false);
    }, [dispatch])
  );

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
        <InlineMessage
          tone="danger"
          description={error}
          icon="alert-circle-outline"
        />
      ) : null}
      {linkSent ? (
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
        placeholder={t("common:placeholders.email")}
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
