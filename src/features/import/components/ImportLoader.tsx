import React from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LottieView from "lottie-react-native";

import { useAppTheme } from "@common/theme/appTheme";

const importLoadingAnimation = require("../../../../assets/animations/travel-is-fun.json");

interface ImportLoaderProps {
  message: string;
}

const ImportLoader: React.FC<ImportLoaderProps> = ({ message }) => {
  const { colors } = useAppTheme();
  const isWeb = Platform.OS === "web";
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulse]);

  const animatedTextStyle = React.useMemo(
    () => ({
      opacity: pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
      transform: [
        {
          translateY: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          }),
        },
      ],
    }),
    [pulse]
  );

  return (
    <View style={styles.container}>
      {isWeb ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <LottieView
          source={importLoadingAnimation}
          autoPlay
          loop
          style={styles.animation}
        />
      )}
      <Animated.Text
        style={[styles.message, animatedTextStyle, { color: colors.text }]}
      >
        {message}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  animation: {
    width: 220,
    height: 220,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});

export default ImportLoader;
