import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { useNotificationsSetup } from "@common/hooks/useNotificationsSetup";
import AppPreferencesProvider from "@common/providers/AppPreferencesProvider";
import AppFontProvider from "@common/providers/AppFontProvider";
import { store, persistor } from "@core/store";
import AuthGate from "@features/auth/navigation/AuthGate";
import { useImportCompletionListener } from "@features/import/hooks/useImportCompletionListener";
import { useShareListener } from "@features/import/hooks/useShareListener";
import "@common/i18n/i18n";

const RootLayout = () => {
  useShareListener();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppFontProvider>
              <AppPreferencesProvider>
                <AppBootstrap />
                <AuthGate />
              </AppPreferencesProvider>
            </AppFontProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const AppBootstrap = () => {
  useNotificationsSetup();
  useImportCompletionListener();
  return null;
};

export default RootLayout;
