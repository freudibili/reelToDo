import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  backgroundColor?: string;
  withBottomInset?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  style,
  noPadding = false,
  backgroundColor = "#fff",
  withBottomInset = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top,
          marginBottom: withBottomInset ? 0 : -insets.bottom,
        },
        noPadding && { paddingHorizontal: 0 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default AppScreen;
