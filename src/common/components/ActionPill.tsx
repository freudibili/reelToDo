import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { Button } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface ActionPillProps {
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  style?: ViewStyle;
}

const ActionPill: React.FC<ActionPillProps> = ({
  label,
  icon,
  iconColor,
  onPress,
  disabled,
  tone = "default",
  style,
}) => {
  const { colors } = useAppTheme();
  const isDanger = tone === "danger";
  const resolvedIconColor =
    iconColor ??
    (isDanger ? colors.favoriteContrast : colors.accent);
  const variant = isDanger ? "danger" : "tonal";

  return (
    <Button
      label={label}
      variant={variant}
      size="sm"
      pill
      icon={<Icon source={icon} size={18} color={resolvedIconColor} />}
      onPress={onPress}
      disabled={disabled}
      shadow={false}
      style={[styles.button, style]}
    />
  );
};

export default ActionPill;

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
  },
});
