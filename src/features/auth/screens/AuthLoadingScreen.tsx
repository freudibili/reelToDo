import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AppScreen from "@common/components/AppScreen";

const AuthLoadingScreen = () => {
  return (
    <AppScreen alignToTabBar={false} withBottomInset>
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    </AppScreen>
  );
};

export default AuthLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
