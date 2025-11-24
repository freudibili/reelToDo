import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useSelector } from "react-redux";
import { View, ActivityIndicator } from "react-native";
import {
  selectIsAuthenticated,
  selectPendingOtpType,
  selectRequiresPasswordChange,
  selectSessionExpired,
} from "@features/auth/store/authSelectors";
import useSupabaseSessionSync from "./useSupabaseSessionSync";

const AuthGate = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const requiresPasswordChange = useSelector(selectRequiresPasswordChange);
  const sessionExpired = useSelector(selectSessionExpired);
  const pendingOtpType = useSelector(selectPendingOtpType);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useSupabaseSessionSync(() => setReady(true));

  useEffect(() => {
    if (!ready) return;
    const segmentsList = [...segments];
    const [rootSegment, nestedSegment] = segmentsList;
    const inAuth = rootSegment === "auth";
    const currentAuthRoute = nestedSegment;

    if (requiresPasswordChange) {
      if (!inAuth || currentAuthRoute !== "reset-password") {
        router.replace("/auth/reset-password");
      }
      return;
    }

    if (sessionExpired) {
      if (!inAuth || currentAuthRoute !== "session-expired") {
        router.replace("/auth/session-expired");
      }
      return;
    }

    if (!isAuth && inAuth && currentAuthRoute === "otp") {
      if (pendingOtpType === "magiclink") {
        router.replace("/auth/magic-link");
        return;
      }
    }

    if (!isAuth && !inAuth) {
      router.replace("/auth");
    } else if (isAuth && inAuth) {
      router.replace("/");
    }
  }, [
    ready,
    isAuth,
    requiresPasswordChange,
    sessionExpired,
    pendingOtpType,
    segments,
    router,
  ]);

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
      <Stack.Screen name="(app)" />
    </Stack>
  );
};

export default AuthGate;
