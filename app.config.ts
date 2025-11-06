import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "ReelToDo",
  slug: "ReelToDo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.reeltodo",
  },
  android: {
    package: "com.anonymous.reeltodo",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    intentFilters: [
      {
        action: "SEND",
        category: ["DEFAULT"],
        data: [{ mimeType: "text/plain" }],
      },
      {
        action: "SEND",
        category: ["DEFAULT"],
        data: [{ mimeType: "image/*" }],
      },
      {
        action: "SEND_MULTIPLE",
        category: ["DEFAULT"],
        data: [{ mimeType: "image/*" }],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-audio"],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
};

export default config;
