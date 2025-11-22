import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signUpWithPassword } from "../store/authSlice";
import { selectAuthLoading, selectAuthError } from "../store/authSelectors";
import type { AppDispatch } from "@core/store";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

const SignUpScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    if (!email || !password) return;
    dispatch(signUpWithPassword({ email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth:signUp.title")}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("common:fields.email")}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder={t("common:fields.password")}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>{t("auth:signUp.submit")}</Text>
        )}
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("auth:signUp.hasAccount")}</Text>
        <Link href="/auth/signin" style={styles.link}>
          {t("auth:signUp.cta")}
        </Link>
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
  },
  button: {
    backgroundColor: "#111827",
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  error: {
    color: "#b91c1c",
  },
  footer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    color: "#2563eb",
    fontSize: 14,
  },
});
