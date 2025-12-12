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
  size = "md",
  style,
}) => {
  const { colors } = useAppTheme();
  const gradientColors = gradient ?? [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];
  const height = size === "sm" ? 42 : 48;
  const horizontalPadding = size === "sm" ? spacing.md : spacing.lg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pressable,
        { opacity: disabled ? 0.6 : pressed ? 0.92 : 1 },
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
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.content}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text variant="headline" weight="700" style={styles.label} numberOfLines={1}>
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
  label: {
    color: "#fff",
  },
});

export default GradientButton;
