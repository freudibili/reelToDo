import { supabase } from "./deps.ts";

type PushParams = {
  userId: string | null;
  activityId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const sendActivityPush = async (
  params: PushParams,
): Promise<void> => {
  const { userId, activityId, title, body, data } = params;
  if (!userId) return;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.log("[fn] push: failed to fetch profile", error);
    return;
  }

  const token = (profile as any)?.expo_push_token as string | undefined;
  if (!token || !token.startsWith("ExponentPushToken")) {
    return;
  }

  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data: {
          activityId,
          url: `/activity/${activityId}`,
          ...data,
        },
        sound: "default",
      }),
    });
  } catch (err) {
    console.log("[fn] push: failed to send", err);
  }
};
