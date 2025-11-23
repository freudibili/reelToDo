import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@config/supabase";
import {
  setPasswordResetRequired,
  setPendingEmail,
  setSession,
} from "@features/auth/store/authSlice";
import type { AppDispatch } from "@core/store";

const useSupabaseSessionSync = (onReady?: () => void) => {
  const dispatch = useDispatch<AppDispatch>();

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

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, onReady]);
};

export default useSupabaseSessionSync;
