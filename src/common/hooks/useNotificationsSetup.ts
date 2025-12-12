import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import {
  registerForPushNotifications,
  savePushToken,
} from "@common/services/pushNotifications";
import { useAppSelector } from "@core/store/hook";
import { selectAuthUser } from "@features/auth/store/authSelectors";

export const useNotificationsSetup = () => {
  const user = useAppSelector(selectAuthUser);
  const userId = user?.id ?? null;
  const router = useRouter();
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as any;
      const activityId = data?.activityId ?? data?.activity_id;
      const targetUrl = data?.url as string | undefined;
      if (activityId) {
        router.push(`/activity/${activityId}` as never);
        return;
      }
      if (typeof targetUrl === "string") {
        router.push(targetUrl as never);
      }
    };

    const setup = async () => {
      const token = await registerForPushNotifications({
        requestPermissions: false,
      });
      if (!active || !token) return;
      if (token !== lastToken.current) {
        await savePushToken(userId, token);
        lastToken.current = token;
      }
    };

    setup();

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => handleResponse(response)
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    return () => {
      active = false;
      responseSub.remove();
    };
  }, [router, userId]);
};
