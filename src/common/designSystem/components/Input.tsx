import React from "react";
import {
  TextInput,
  type TextInputProps,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "../../theme/appTheme";
import { radii, spacing } from "../tokens";
import Box from "./Box";
import Text from "./Text";

type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onRightIconPress?: () => void;
};

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      editable = true,
      multiline = false,
      ...rest
    },
    ref
  ) => {
    const { colors } = useAppTheme();
    const [focused, setFocused] = React.useState(false);

    const borderColor = error
      ? colors.danger
      : focused
        ? colors.primary
        : colors.border;
    const backgroundColor = editable ? colors.surface : colors.mutedSurface;
    const textColor = colors.text;
    const placeholderColor = colors.secondaryText;

    const renderIcon = (icon: React.ReactNode | string) =>
      typeof icon === "string" ? (
        <Icon source={icon} size={18} color={placeholderColor} />
      ) : (
        icon
      );

    return (
      <Box gap={spacing.xs}>
        {label ? (
          <Text variant="headline" weight="700">
            {label}
          </Text>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor,
            },
          ]}
        >
          {leftIcon ? (
            <View style={styles.icon}>{renderIcon(leftIcon)}</View>
          ) : null}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: textColor,
              },
              multiline ? styles.multiline : undefined,
              style,
            ]}
            placeholderTextColor={placeholderColor}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            editable={editable}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            {...rest}
          />

          {rightIcon ? (
            <Pressable
              style={styles.icon}
              onPress={onRightIconPress}
              hitSlop={10}
              disabled={!onRightIconPress}
            >
              {renderIcon(rightIcon)}
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </Box>
    );
  }
);

Input.displayName = "Input";

export default Input;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 110,
    paddingVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
