import React from "react";
import { Animated, StyleSheet } from "react-native";

import { Stack } from "@common/designSystem";
import { radii } from "@common/designSystem/tokens";
import type { AppTheme } from "@common/theme/appTheme";

type Props = {
  total: number;
  scrollX: Animated.Value;
  slideWidth: number;
  colors: AppTheme["colors"];
};

const OnboardingDots: React.FC<Props> = ({
  total,
  scrollX,
  slideWidth,
  colors,
}) => {
  return (
    <Stack direction="row" align="center" justify="center" gap="sm" paddingBottom="xl">
      {Array.from({ length: total }).map((_, idx) => (
        <ProgressDot
          key={idx}
          index={idx}
          scrollX={scrollX}
          width={slideWidth}
          activeColor={colors.primary}
          inactiveColor={colors.secondaryText}
        />
      ))}
    </Stack>
  );
};

type ProgressDotProps = {
  index: number;
  scrollX: Animated.Value;
  width: number;
  activeColor: string;
  inactiveColor: string;
};

const ProgressDot: React.FC<ProgressDotProps> = ({
  index,
  scrollX,
  width,
  activeColor,
  inactiveColor,
}) => {
  const inputRange = [
    (index - 1) * width,
    index * width,
    (index + 1) * width,
  ];

  const dotWidth = scrollX.interpolate({
    inputRange,
    outputRange: [8, 24, 8],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.45, 1, 0.45],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: dotWidth,
          backgroundColor: activeColor,
          opacity,
          borderColor: inactiveColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default OnboardingDots;
