import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { Icon } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Box, Button, GradientButton, Stack, Text } from "@common/designSystem";
import { getShadowStyle, radii, spacing } from "@common/designSystem/tokens";
import { completeOnboarding } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch } from "@core/store/hook";

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  accentSurface: string;
  icon: string;
};

const animationSource = require("../../../../assets/animations/travel-is-fun.json");
const isWeb = Platform.OS === "web";

const OnboardingScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation("onboarding");
  const insets = useSafeAreaInsets();
  const { colors, mode } = useAppTheme();
  const { width } = useWindowDimensions();
  const slideWidth = width - 48;

  const slides = React.useMemo<Slide[]>(
    () => [
      {
        key: "share",
        eyebrow: t("slides.share.eyebrow"),
        title: t("slides.share.title"),
        body: t("slides.share.body"),
        accent: colors.primary,
        accentSurface: colors.primarySurface,
        icon: "share-variant",
      },
      {
        key: "find",
        eyebrow: t("slides.find.eyebrow"),
        title: t("slides.find.title"),
        body: t("slides.find.body"),
        accent: colors.accent,
        accentSurface: colors.accentSurface,
        icon: "map-search",
      },
      {
        key: "go",
        eyebrow: t("slides.go.eyebrow"),
        title: t("slides.go.title"),
        body: t("slides.go.body"),
        accent: colors.primaryStrong,
        accentSurface: colors.mutedSurface,
        icon: "walk",
      },
    ],
    [colors, t]
  );

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const flatListRef = React.useRef<FlatList<Slide>>(null);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack flex={1} gap="lg">
          <Stack
            direction="row"
            align="center"
            justify="flex-end"
            paddingHorizontal="lg"
            paddingTop="sm"
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
            snapToInterval={slideWidth}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{
              paddingHorizontal: (width - slideWidth) / 2,
              paddingTop: spacing.md,
              paddingBottom: spacing.lg,
            }}
            renderItem={({ item, index }) => (
              <SlideCard
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

          <Stack
            gap="md"
            paddingHorizontal="lg"
            paddingBottom={Math.max(insets.bottom, spacing.lg)}
          >
            <Stack direction="row" justify="space-between" align="center">
              <Text variant="title3" weight="800">
                {t("title")}
              </Text>
              <Text variant="caption" tone="muted">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </Text>
            </Stack>

            <Stack gap="md">
              <Stack direction="row" align="center" justify="center" gap="sm">
                {slides.map((slide, idx) => (
                  <ProgressDot
                    key={slide.key}
                    index={idx}
                    scrollX={scrollX}
                    width={slideWidth}
                    activeColor={colors.primary}
                    inactiveColor={colors.secondaryText}
                  />
                ))}
              </Stack>

              <GradientButton label={actionLabel} onPress={handleNext} />
            </Stack>
          </Stack>
        </Stack>
      </SafeAreaView>
    </View>
  );
};

type SlideCardProps = {
  item: Slide;
  index: number;
  width: number;
  scrollX: Animated.Value;
  colors: ReturnType<typeof useAppTheme>["colors"];
  mode: ReturnType<typeof useAppTheme>["mode"];
};

const SlideCard: React.FC<SlideCardProps> = ({
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
              <Icon source="sparkles" size={18} color={item.accent} />
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

              <Box
                direction="row"
                align="center"
                gap={6}
                paddingHorizontal="sm"
                paddingVertical="xs"
                rounded="pill"
                background={colors.overlay}
                style={styles.artworkBadge}
              >
                <Icon source="motion" size={16} color={item.accent} />
                <Text variant="caption" style={{ color: item.accent }}>
                  {item.eyebrow}
                </Text>
              </Box>
            </Box>
          </Stack>
        </LinearGradient>
      </View>
    </Animated.View>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  floatingShape: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 200,
    opacity: 0.2,
  },
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
  artworkBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default OnboardingScreen;
