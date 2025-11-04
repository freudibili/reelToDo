import React, { useEffect } from "react";
import { Stack, Redirect } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PaperProvider } from "react-native-paper";
import { store, persistor } from "@core/store";
import paperTheme from "@common/theme/paperTheme";
import { selectIsAuthenticated } from "@features/auth/store/authSelectors";
import { supabase } from "@config/supabase";
import { setSession } from "@features/auth/store/authSlice";
import type { AppDispatch } from "@core/store";

const AuthBootstrapper = () => {
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
  }, [dispatch]);

  return null;
};

const AppRouter = () => {
  const isAuth = useSelector(selectIsAuthenticated);

  if (!isAuth) {
    return (
      <>
        <AuthBootstrapper />
        <Redirect href="/auth/signin" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <AuthBootstrapper />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={paperTheme}>
          <AppRouter />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
