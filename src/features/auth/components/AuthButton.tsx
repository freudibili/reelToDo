import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
};

const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
}) => {
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";
  const backgroundColor = isGhost
    ? "transparent"
    : isSecondary
      ? "#e2e8f0"
      : "#0f172a";
  const textColor = isGhost ? "#2563eb" : isSecondary ? "#0f172a" : "#fff";
  const borderColor = isGhost ? "transparent" : "transparent";
  const borderWidth = isGhost ? 0 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    transform: [{ translateY: 0.5 }],
  },
  label: {
    fontWeight: "700",
    fontSize: 15,
  },
});
