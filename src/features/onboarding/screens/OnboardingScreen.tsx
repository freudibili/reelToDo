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
import { Box, Button, GradientButton, Stack } from "@common/designSystem";
import { spacing } from "@common/designSystem/tokens";
import { completeOnboarding } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch } from "@core/store/hook";

import OnboardingDots from "../components/OnboardingDots";
import OnboardingSlideCard from "../components/OnboardingSlideCard";
import { buildSlides } from "../utils/slides";
import type { OnboardingSlide } from "../types";

const OnboardingScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation("onboarding");
  const { colors, mode } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const preferredSlideWidth = Math.round(width * 0.86);
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

  const handleNext = () => {
    const lastIndex = slides.length - 1;
    if (currentIndex >= lastIndex) {
      completeFlow();
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };

  const handleSkip = () => {
    completeFlow();
  };

  const actionLabel =
    currentIndex === slides.length - 1
      ? t("actions.start")
      : t("actions.next");

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
      <View
        pointerEvents="none"
        style={[
          styles.floatingShape,
          {
            backgroundColor: colors.primarySurface,
            top: -120,
            right: -80,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.floatingShape,
          {
            backgroundColor: colors.accentSurface,
            bottom: -160,
            left: -110,
          },
        ]}
      />

      <Stack flex={1} gap="lg" paddingTop="sm">
        <Stack
          direction="row"
          align="center"
          justify="flex-end"
          paddingHorizontal="lg"
        >
          <Button
            label={t("actions.skip")}
            onPress={handleSkip}
            size="sm"
            pill
            variant="ghost"
          />
        </Stack>

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
            paddingTop: spacing.md,
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
          paddingTop="lg"
          paddingBottom={Math.max(insets.bottom, spacing.lg)}
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
  floatingShape: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 200,
    opacity: 0.2,
  },
});

export default OnboardingScreen;
