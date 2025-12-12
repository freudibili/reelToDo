import { Stack } from "expo-router";
import React from "react";

const SettingsStackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="support" />
      <Stack.Screen name="about" />
    </Stack>
  );
};

export default SettingsStackLayout;
