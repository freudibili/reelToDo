import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";

type MagicLinkButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const MagicLinkButton: React.FC<MagicLinkButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.touchable, disabled && styles.touchableDisabled]}
    >
      <LinearGradient
        colors={["#f97316", "#ec4899", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.content}>
            <Icon source="star-four-points" color="#fff" size={18} />
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default MagicLinkButton;

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 9999,
    overflow: "hidden",
  },
  touchableDisabled: {
    opacity: 0.7,
  },
  gradient: {
    height: 48,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
