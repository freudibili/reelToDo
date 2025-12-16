import type { TFunction } from "i18next";

import type { AppTheme } from "@common/theme/appTheme";

import type { OnboardingSlide } from "../types";

const slide1 = require("../../../../assets/images/onboarding/slide1.jpg");
const slide2 = require("../../../../assets/images/onboarding/slide2.jpg");
const slide3 = require("../../../../assets/images/onboarding/slide3.jpg");

export const buildSlides = (
  colors: AppTheme["colors"],
  t: TFunction<"onboarding">
): OnboardingSlide[] => [
  {
    key: "share",
    eyebrow: t("slides.share.eyebrow"),
    title: t("slides.share.title"),
    body: t("slides.share.body"),
    accent: colors.primary,
    accentSurface: colors.primarySurface,
    icon: "share-variant",
    backgroundImage: slide1,
    gradientStart: colors.primary,
    gradientEnd: colors.primarySurface,
  },
  {
    key: "find",
    eyebrow: t("slides.find.eyebrow"),
    title: t("slides.find.title"),
    body: t("slides.find.body"),
    accent: colors.accent,
    accentSurface: colors.accentSurface,
    icon: "map-search",
    backgroundImage: slide2,
    gradientStart: colors.accent,
    gradientEnd: colors.accentSurface,
  },
  {
    key: "go",
    eyebrow: t("slides.go.eyebrow"),
    title: t("slides.go.title"),
    body: t("slides.go.body"),
    accent: colors.primaryStrong,
    accentSurface: colors.mutedSurface,
    icon: "walk",
    backgroundImage: slide3,
    gradientStart: colors.secondary,
    gradientEnd: colors.mutedSurface,
  },
];
