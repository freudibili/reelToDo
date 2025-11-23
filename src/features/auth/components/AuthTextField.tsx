import React, { forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

const AuthTextField = forwardRef<TextInput, Props>(
  ({ label, hint, style, ...inputProps }, ref) => {
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor="#94a3b8"
          {...inputProps}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#0f172a",
  },
  hint: {
    fontSize: 13,
    color: "#64748b",
  },
});
