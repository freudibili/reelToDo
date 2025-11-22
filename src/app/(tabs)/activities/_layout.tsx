import React from "react";
import { Stack } from "expo-router";

const ActivitiesStackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[category]" />
    </Stack>
  );
};

export default ActivitiesStackLayout;
