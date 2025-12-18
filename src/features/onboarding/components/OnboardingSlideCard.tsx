import React from "react";
import { Animated, ImageBackground, StyleSheet, View } from "react-native";

import { getShadowStyle, radii, spacing } from "@common/designSystem/tokens";
import type { AppTheme } from "@common/theme/appTheme";

import type { OnboardingSlide } from "../types";

type Props = {
  item: OnboardingSlide;
  index: number;
  width: number;
  scrollX: Animated.Value;
  colors: AppTheme["colors"];
  mode: AppTheme["mode"];
};

const OnboardingSlideCard: React.FC<Props> = ({
  item,
  index,
  width,
  scrollX,
  colors,
  mode,
}) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.94, 1, 0.94],
    extrapolate: "clamp",
  });
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [16, 0, 16],
    extrapolate: "clamp",
  });
  return (
    <Animated.View
      style={[
        styles.slide,
        {
          width,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[styles.cardShadow, getShadowStyle(mode, "lg", item.accent)]}
      >
        <ImageBackground
          source={item.backgroundImage}
          style={[styles.card, { borderColor: item.accent }]}
          imageStyle={styles.cardImage}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.overlay,
              { backgroundColor: colors.backdrop },
            ]}
          />
        </ImageBackground>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  cardShadow: {
    flex: 1,
    borderRadius: radii.xl,
  },
  card: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardImage: {
    borderRadius: radii.xl,
  },
  overlay: {
    opacity: 0.55,
  },
});

export default OnboardingSlideCard;
