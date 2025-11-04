import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@config/supabase";
import { setSession } from "@features/auth/store/authSlice";
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(
        setSession({
          session,
          user: session ? session.user : null,
        })
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, onReady]);
};

export default useSupabaseSessionSync;
