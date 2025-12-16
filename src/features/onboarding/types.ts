import type { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  accentSurface: string;
  icon: string;
  backgroundImage: ImageSourcePropType;
  gradientStart: string;
  gradientEnd: string;
};
