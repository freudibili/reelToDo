import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Icon } from "react-native-paper";

import { Box, Stack, Text } from "@common/designSystem";
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

const animationSource = require("../../../../assets/animations/travel-is-fun.json");
const isWeb = Platform.OS === "web";

const OnboardingSlideCard: React.FC<Props> = ({
  item,
  index,
  width,
  scrollX,
  colors,
  mode,
}) => {
  const inputRange = [
    (index - 1) * width,
    index * width,
    (index + 1) * width,
  ];

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
  const glowOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.25, 0.85, 0.25],
    extrapolate: "clamp",
  });

  const canPlayAnimation = !isWeb;

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
      <View style={[styles.cardShadow, getShadowStyle(mode, "lg", item.accent)]}>
        <LinearGradient
          colors={[item.accentSurface, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: item.accent }]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                backgroundColor: item.accent,
                opacity: glowOpacity,
              },
            ]}
          />

          <Stack gap="md">
            <Stack
              direction="row"
              align="center"
              justify="space-between"
              gap="sm"
            >
              <Box
                direction="row"
                align="center"
                gap={8}
                paddingHorizontal="sm"
                paddingVertical="xs"
                rounded="pill"
                background={colors.overlay}
                border
                borderColor={item.accent}
              >
                <Icon source={item.icon} size={18} color={item.accent} />
                <Text
                  variant="eyebrow"
                  weight="800"
                  style={{ color: item.accent }}
                >
                  {item.eyebrow}
                </Text>
              </Box>
              <Icon source="auto-fix" size={18} color={item.accent} />
            </Stack>

            <Stack gap="sm">
              <Text variant="title1" weight="800">
                {item.title}
              </Text>
              <Text variant="body" tone="muted">
                {item.body}
              </Text>
            </Stack>

            <Box
              rounded="xl"
              padding="md"
              background={colors.surface}
              border
              borderColor={colors.border}
              style={styles.artwork}
            >
              <LinearGradient
                colors={[item.accentSurface, colors.overlay]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {canPlayAnimation ? (
                <LottieView
                  source={animationSource}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              ) : (
                <Icon source={item.icon} size={96} color={item.accent} />
              )}
            </Box>
          </Stack>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slide: {
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
  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 180,
    top: -80,
    right: -40,
    opacity: 0.2,
    transform: [{ rotate: "-12deg" }],
  },
  artwork: {
    height: 220,
    overflow: "hidden",
  },
  animation: {
    flex: 1,
  },
});

export default OnboardingSlideCard;
