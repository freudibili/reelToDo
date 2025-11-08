import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PaperProvider } from "react-native-paper";
import { store, persistor } from "@core/store";
import paperTheme from "@common/theme/paperTheme";
import AuthGate from "@features/auth/navigation/AuthGate";
import { useShareListener } from "@features/import/hooks/useShareListener";

const RootLayout = () => {
  useShareListener();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={paperTheme}>
          <AuthGate />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
