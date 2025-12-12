import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@common/theme/appTheme";

const TabsLayout = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="activities"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: t("navigation.tabs.activities"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities-map"
        options={{
          title: t("navigation.tabs.map"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="map" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities-calendar"
        options={{
          title: t("navigation.tabs.calendar"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="calendar-month" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("navigation.tabs.settings"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
