import { useFonts } from "expo-font";
import React from "react";
import { ActivityIndicator, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

const AppFontProvider: React.FC<Props> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    "ZTNature-Medium": require("../../../assets/fonts/ZTNature-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AppFontProvider;
