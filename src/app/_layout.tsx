import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PaperProvider } from "react-native-paper";
import { store, persistor } from "@core/store";
import paperTheme from "@common/theme/paperTheme";
import AuthGate from "@features/auth/navigation/AuthGate";
import { useShareListener } from "@features/import/hooks/useShareListener";
import "@common/i18n/i18n";

const RootLayout = () => {
  useShareListener();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PaperProvider theme={paperTheme}>
              <AuthGate />
            </PaperProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
