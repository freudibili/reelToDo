import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useRef } from "react";

import {
  registerForPushNotifications,
  savePushToken,
} from "@common/services/pushNotifications";

const FIRST_IMPORT_NOTIFICATION_KEY = "notifications:first-import-requested";

export const useImportNotificationPermission = (
  userId: string | null
) => {
  const inFlightRef = useRef(false);

  return useCallback(async () => {
    if (!userId || inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const userKey = `${FIRST_IMPORT_NOTIFICATION_KEY}:${userId}`;
      const legacyRequested =
        (await AsyncStorage.getItem(FIRST_IMPORT_NOTIFICATION_KEY)) === "1";
      const alreadyRequested =
        legacyRequested || (await AsyncStorage.getItem(userKey)) === "1";

      const token = await registerForPushNotifications({
        requestPermissions: !alreadyRequested,
      });

      if (!alreadyRequested) {
        await AsyncStorage.setItem(userKey, "1");
        if (legacyRequested) {
          await AsyncStorage.removeItem(FIRST_IMPORT_NOTIFICATION_KEY);
        }
      }

      if (token) {
        await savePushToken(userId, token);
      }
    } catch (err) {
      console.log("[push] import notification request failed", err);
    } finally {
      inFlightRef.current = false;
    }
  }, [userId]);
};
