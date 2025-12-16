import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@common/components/AppScreen";
import { Box, Chip, GradientButton, Stack, Text } from "@common/designSystem";
import { spacing } from "@common/designSystem/tokens";
import { completeOnboarding } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch } from "@core/store/hook";

import OnboardingDots from "../components/OnboardingDots";
import OnboardingSlideCard from "../components/OnboardingSlideCard";
import { buildSlides } from "../utils/slides";
import type { OnboardingSlide } from "../types";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const OnboardingScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation("onboarding");
  const { colors, mode } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const preferredSlideWidth = Math.round(width * 0.82);
  const maxSlideWidth = width - spacing.lg * 2;
  const slideWidth = Math.min(preferredSlideWidth, maxSlideWidth);
  const horizontalPadding = (width - slideWidth) / 2;

  const slides = React.useMemo<OnboardingSlide[]>(
    () => buildSlides(colors, t),
    [colors, t]
  );

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const flatListRef = React.useRef<FlatList<OnboardingSlide>>(null);
  const snapOffsets = React.useMemo(
    () => slides.map((_, idx) => idx * slideWidth),
    [slides, slideWidth]
  );

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === "number") {
        setCurrentIndex(nextIndex);
      }
    }
  ).current;

  const completeFlow = React.useCallback(() => {
    dispatch(completeOnboarding());
    router.replace("/activities");
  }, [dispatch, router]);

  const handleNext = React.useCallback(() => {
    const lastIndex = slides.length - 1;
    if (currentIndex >= lastIndex) {
      completeFlow();
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  }, [completeFlow, currentIndex, slides.length]);

  const handleSkip = React.useCallback(() => {
    completeFlow();
  }, [completeFlow]);

  const actionLabel =
    currentIndex === slides.length - 1 ? t("actions.start") : t("actions.next");

  const gradientLayers = React.useMemo(
    () =>
      slides.map((slide, idx) => {
        const inputRange = [
          (idx - 1) * slideWidth,
          idx * slideWidth,
          (idx + 1) * slideWidth,
        ];
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });

        return (
          <AnimatedLinearGradient
            pointerEvents="none"
            key={slide.key}
            colors={[slide.gradientStart, slide.gradientEnd, colors.background]}
            style={[
              styles.lightWash,
              {
                top: -insets.top,
                bottom: 0,
                opacity,
              },
            ]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
          />
        );
      }),
    [slides, slideWidth, scrollX, insets.top, colors.background]
  );

  const slideHeadlines = React.useMemo(
    () =>
      slides.map((slide, idx) => {
        const inputRange = [
          (idx - 1) * slideWidth,
          idx * slideWidth,
          (idx + 1) * slideWidth,
        ];
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });
        const translateY = scrollX.interpolate({
          inputRange,
          outputRange: [24, 0, -24],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={`${slide.key}-headline`}
            pointerEvents="none"
            style={[
              styles.titleLayer,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text variant="title1" weight="800" style={styles.titleText}>
              {slide.title}
            </Text>
            <Text variant="body" tone="muted" style={styles.subtitleText}>
              {slide.body}
            </Text>
          </Animated.View>
        );
      }),
    [slides, slideWidth, scrollX]
  );

  return (
    <AppScreen
      noPadding
      backgroundColor={colors.background}
      scrollable={false}
      withBottomInset
    >
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {gradientLayers}
      <Stack flex={1} gap="sm" paddingTop="sm" paddingBottom={"xs"}>
        <Stack
          direction="row"
          align="center"
          justify="flex-end"
          paddingHorizontal="lg"
        >
          <Chip
            label={t("actions.skip")}
            onPress={handleSkip}
            tone="neutral"
            textColor={colors.favoriteContrast}
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
            }}
            accessibilityRole="button"
          />
        </Stack>

        <View
          style={[
            styles.titleArea,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {slideHeadlines}
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled={false}
          snapToOffsets={snapOffsets}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: spacing.xxs,
            paddingBottom: spacing.lg,
          }}
          renderItem={({ item, index }) => (
            <OnboardingSlideCard
              item={item}
              index={index}
              width={slideWidth}
              scrollX={scrollX}
              colors={colors}
              mode={mode}
            />
          )}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
          scrollEventThrottle={16}
          bounces={false}
        />

        <OnboardingDots
          total={slides.length}
          scrollX={scrollX}
          slideWidth={slideWidth}
          colors={colors}
        />

        <Box
          paddingHorizontal="lg"
          paddingTop="xs"
          paddingBottom={Math.max(insets.bottom, spacing.xs)}
        >
          <Stack align="center" fullWidth>
            <GradientButton
              label={actionLabel}
              onPress={handleNext}
              style={{ minWidth: 220 }}
            />
          </Stack>
        </Box>
      </Stack>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  lightWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  titleArea: {
    minHeight: 100,
    justifyContent: "center",
    position: "relative",
  },
  titleLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  titleText: {
    textAlign: "center",
  },
  subtitleText: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
});

export default OnboardingScreen;
