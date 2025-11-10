import React from "react";
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: ({ color, size }) => (
            <Icon source="pine-tree" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities-map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Icon source="map" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities-calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Icon source="calendar-month" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: "Import",
          tabBarIcon: ({ color, size }) => (
            <Icon source="link-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Icon source="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
