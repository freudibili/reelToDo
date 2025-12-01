import React from "react";
import { Stack } from "expo-router";

const AppStackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="journeys/[id]" />
    </Stack>
  );
};

export default AppStackLayout;
