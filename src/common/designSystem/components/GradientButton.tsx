import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppTheme } from "../../theme/appTheme";
import Text from "./Text";
import { radii, spacing } from "../tokens";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  gradient?: [string, string];
  disabledGradient?: [string, string];
  size?: "sm" | "md";
  style?: ViewStyle;
};

const GradientButton: React.FC<Props> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  gradient,
  disabledGradient,
  size = "md",
  style,
}) => {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;
  const gradientColors =
    isDisabled && disabledGradient
      ? disabledGradient
      : gradient ?? [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];
  const contentColor = colors.favoriteContrast;
  const height = size === "sm" ? 42 : 48;
  const horizontalPadding = size === "sm" ? spacing.md : spacing.lg;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.pressable,
        { opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { height, paddingHorizontal: horizontalPadding, borderRadius: radii.pill },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : (
          <View style={styles.content}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text variant="headline" weight="700" style={{ color: contentColor }} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    transform: [{ translateY: 0.5 }],
  },
});

export default GradientButton;
