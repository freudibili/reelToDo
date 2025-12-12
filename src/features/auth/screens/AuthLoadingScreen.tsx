import React from "react";
import { ActivityIndicator } from "react-native";

import { Box } from "@common/designSystem";
import AppScreen from "@common/components/AppScreen";
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
