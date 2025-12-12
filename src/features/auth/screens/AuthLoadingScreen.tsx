import React from "react";
import { ActivityIndicator } from "react-native";

import { Box } from "@common/designSystem";
import AppScreen from "@common/components/AppScreen";

const AuthLoadingScreen = () => {
  return (
    <AppScreen alignToTabBar={false} withBottomInset>
      <Box flex={1} center>
        <ActivityIndicator />
      </Box>
    </AppScreen>
  );
};

export default AuthLoadingScreen;
