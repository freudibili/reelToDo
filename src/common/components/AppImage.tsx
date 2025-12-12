import React, { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { useAppTheme } from "@common/theme/appTheme";

const FALLBACK_IMAGE = require("../../../assets/images/activityFallback.png");

interface AppImageProps {
  uri?: string | null;
  children?: React.ReactNode;
  style?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
}

const AppImage: React.FC<AppImageProps> = ({
  uri,
  children,
  style,
  resizeMode = "cover",
}) => {
  const { colors } = useAppTheme();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const hasValidUrl = !!uri && !hasError;

  const source: ImageSourcePropType = hasValidUrl
    ? { uri: uri! }
    : FALLBACK_IMAGE;

  if (!hasValidUrl) {
    // 🔹 Fallback: PNG centré, plus petit
    return (
      <View
        style={[
          styles.base,
          style,
          {
            backgroundColor: colors.lightGray,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Image
          source={source}
          style={styles.fallbackImage}
          resizeMode="contain"
        />
        {children}
      </View>
    );
  }

  // 🔹 Image distante valide
  return (
    <View
      style={[
        styles.base,
        style,
        {
          backgroundColor: colors.lightGray,
        },
      ]}
    >
      <Image
        source={source}
        style={styles.fullImage}
        resizeMode={resizeMode}
        onError={() => setHasError(true)}
      />
      {children}
    </View>
  );
};

export default AppImage;

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  fallbackImage: {
    width: "60%", // ~50–60% of the container
    height: "60%",
  },
});
