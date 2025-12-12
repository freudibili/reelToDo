import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "@config/supabase";
import type { AppDispatch } from "@core/store";
import {
  setPasswordResetRequired,
  setPendingEmail,
  setSession,
} from "@features/auth/store/authSlice";

const extractSessionFromUrl = (url: string) => {
  const [, hash] = url.split("#");
  const [, query] = url.split("?");
  const params = new URLSearchParams(hash || query || "");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");
  const email = params.get("email");
  return accessToken && refreshToken
    ? { accessToken, refreshToken, type, email }
    : null;
};

const useSupabaseSessionSync = (onReady?: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const lastHandledToken = useRef<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      dispatch(
        setSession({
          session: data.session,
          user: data.session ? data.session.user : null,
        })
      );
      if (onReady) onReady();
    };

    run();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(
        setSession({
          session,
          user: session ? session.user : null,
        })
      );
      if (event === "PASSWORD_RECOVERY") {
        dispatch(setPasswordResetRequired(true));
        if (session?.user?.email) {
          dispatch(setPendingEmail(session.user.email));
        }
      }
    });

    const handleDeepLink = async (url?: string | null) => {
      if (!url) return;
      const sessionFromUrl = extractSessionFromUrl(url);
      if (!sessionFromUrl) return;

      const signature = `${sessionFromUrl.accessToken}:${sessionFromUrl.refreshToken}`;
      if (lastHandledToken.current === signature) return;

      lastHandledToken.current = signature;
      const { error } = await supabase.auth.setSession({
        access_token: sessionFromUrl.accessToken,
        refresh_token: sessionFromUrl.refreshToken,
      });
      if (error) {
        console.warn("Failed to set session from magic link", error.message);
      } else if (sessionFromUrl.type === "recovery") {
        dispatch(setPasswordResetRequired(true));
        if (sessionFromUrl.email) {
          dispatch(setPendingEmail(sessionFromUrl.email));
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkSubscription = Linking.addEventListener("url", (event) =>
      handleDeepLink(event.url)
    );

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [dispatch, onReady]);
};

export default useSupabaseSessionSync;
