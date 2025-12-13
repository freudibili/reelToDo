import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import type { NotificationBehavior } from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "@config/supabase";
import type { ProfileEmailRow } from "@features/settings/utils/types";

const defaultNotificationBehavior: NotificationBehavior = {
  shouldShowAlert: true,
  shouldPlaySound: false,
  shouldSetBadge: false,
  shouldShowBanner: true,
  shouldShowList: true,
};

Notifications.setNotificationHandler({
  handleNotification: async () => defaultNotificationBehavior,
});

type PushRegistrationOptions = {
  requestPermissions?: boolean;
};

export const registerForPushNotifications = async (
  options: PushRegistrationOptions = {}
): Promise<string | null> => {
  try {
    const { requestPermissions = true } = options;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      if (!requestPermissions) {
        return null;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId ??
      undefined;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return token?.data ?? null;
  } catch (err) {
    console.log("[push] registration failed", err);
    return null;
  }
};

export const savePushToken = async (
  userId: string,
  token: string
): Promise<void> => {
  // Ensure we always provide a non-null email to satisfy DB constraint on profiles.email.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle<ProfileEmailRow>();

  const { data: authData } = await supabase.auth.getUser();
  const email = existingProfile?.email ?? authData?.user?.email ?? "";

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId, email: email || "", expo_push_token: token },
      { onConflict: "user_id" }
    );

  if (error) {
    console.log("[push] failed to persist token", error);
  }
};
