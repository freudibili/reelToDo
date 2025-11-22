import React from "react";
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

const TabsLayout = () => {
  const { t } = useTranslation();

  return (
    <Tabs
      initialRouteName="activities"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
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
            <Icon source="pine-tree" color={color} size={size} />
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
