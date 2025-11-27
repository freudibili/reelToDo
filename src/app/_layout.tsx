import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@core/store";
import AuthGate from "@features/auth/navigation/AuthGate";
import { useShareListener } from "@features/import/hooks/useShareListener";
import AppPreferencesProvider from "@common/providers/AppPreferencesProvider";
import "@common/i18n/i18n";

const RootLayout = () => {
  useShareListener();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppPreferencesProvider>
              <AuthGate />
            </AppPreferencesProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
