import { Stack } from "expo-router";
import React from "react";

const AppStackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding"
        options={{ presentation: "modal", animation: "fade" }}
      />
    </Stack>
  );
};

export default AppStackLayout;
