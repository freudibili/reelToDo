import React, { forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { useAppTheme } from "@common/theme/appTheme";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

const AuthTextField = forwardRef<TextInput, Props>(
  ({ label, hint, style, ...inputProps }, ref) => {
    const { colors } = useAppTheme();

    return (
      <View style={styles.container}>
        {label ? (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        ) : null}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.secondaryText}
          {...inputProps}
        />
        {hint ? (
          <Text style={[styles.hint, { color: colors.secondaryText }]}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
  },
});
