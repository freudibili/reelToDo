import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useSelector } from "react-redux";
import { View, ActivityIndicator } from "react-native";
import { selectIsAuthenticated } from "@features/auth/store/authSelectors";
import useSupabaseSessionSync from "./useSupabaseSessionSync";

const AuthGate = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useSupabaseSessionSync(() => setReady(true));

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === "auth";
    if (!isAuth && !inAuth) {
      router.replace("/auth/signin");
    } else if (isAuth && inAuth) {
      router.replace("/");
    }
  }, [ready, isAuth, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default AuthGate;
