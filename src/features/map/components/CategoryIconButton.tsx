import React from "react";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "@common/theme/appTheme";
import { spacing } from "@common/designSystem";

type Props = PressableProps & {
  icon: string;
  label: string;
  selected?: boolean;
};

const CategoryIconButton: React.FC<Props> = ({
  icon,
  label,
  selected = false,
  style,
  disabled,
  hitSlop,
  ...pressableProps
}) => {
  const { colors } = useAppTheme();
  const backgroundColor = selected ? colors.primary : colors.surface;
  const borderColor = selected ? colors.primary : colors.border;
  const iconColor = selected ? colors.surface : colors.mutedText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={(state) => {
        const { pressed } = state;
        return [
          styles.container,
          {
            backgroundColor,
            borderColor,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
      disabled={disabled}
      hitSlop={hitSlop ?? 8}
      {...pressableProps}
    >
      <View style={styles.iconWrapper}>
        <Icon source={icon} size={18} color={iconColor} />
      </View>
    </Pressable>
  );
};

export default CategoryIconButton;

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
