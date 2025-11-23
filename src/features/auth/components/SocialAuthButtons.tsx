import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import {
  selectAuthRequestStatus,
  selectAuthError,
} from "@features/auth/store/authSelectors";
import { clearError, signInWithProvider } from "@features/auth/store/authSlice";

type Props = {
  compact?: boolean;
};

const SocialAuthButtons: React.FC<Props> = ({ compact = false }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const oauthStatus = useAppSelector(selectAuthRequestStatus("oauth"));
  const error = useAppSelector(selectAuthError);
  const loading = oauthStatus === "pending";

  const handlePress = (provider: "google" | "apple" | "facebook") => {
    dispatch(clearError());
    dispatch(signInWithProvider({ provider }));
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={styles.or}>{t("auth:social.or")}</Text>
      {error && oauthStatus === "failed" ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.button, styles.google, loading && styles.disabled]}
        onPress={() => handlePress("google")}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          <FontAwesome name="google" size={18} color="#DB4437" />
          <Text style={styles.buttonText}>Google</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.facebook, loading && styles.disabled]}
        onPress={() => handlePress("facebook")}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          <FontAwesome name="facebook" size={18} color="#fff" />
          <Text style={[styles.buttonText, styles.facebookText]}>
            Facebook
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.apple, loading && styles.disabled]}
        onPress={() => handlePress("apple")}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          <FontAwesome name="apple" size={18} color="#fff" />
          <Text style={[styles.buttonText, styles.appleText]}>Apple</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SocialAuthButtons;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 10,
  },
  compact: {
    marginTop: 6,
  },
  or: {
    textAlign: "center",
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  google: {},
  facebook: {
    backgroundColor: "#1877f2",
    borderColor: "#1877f2",
  },
  apple: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a",
  },
  facebookText: {
    color: "#fff",
  },
  appleText: {
    color: "#fff",
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: "#b91c1c",
    textAlign: "center",
  },
});
