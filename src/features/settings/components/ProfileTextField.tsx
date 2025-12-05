import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { useAppTheme } from "@common/theme/appTheme";

interface ProfileTextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  helperText?: string;
}

const ProfileTextField: React.FC<ProfileTextFieldProps> = ({
  label,
  helperText,
  editable = true,
  ...inputProps
}) => {
  const { colors } = useAppTheme();
  const disabled = editable === false;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        {...inputProps}
        editable={editable}
        placeholderTextColor={colors.secondaryText}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      />
      {helperText ? (
        <Text style={[styles.helper, { color: colors.secondaryText }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

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
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  helper: {
    fontSize: 12,
  },
});

export default ProfileTextField;
