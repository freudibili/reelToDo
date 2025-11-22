import React from "react";
import { Stack } from "expo-router";

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
