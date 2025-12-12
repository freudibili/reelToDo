import React from "react";
import { ActivityIndicator } from "react-native";

import AppScreen from "@common/components/AppScreen";
import { Box } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

const AuthLoadingScreen = () => {
  const { colors } = useAppTheme();

  return (
    <AppScreen alignToTabBar={false} withBottomInset>
      <Box flex={1} center>
        <ActivityIndicator color={colors.primary} />
      </Box>
    </AppScreen>
  );
};

export default AuthLoadingScreen;
