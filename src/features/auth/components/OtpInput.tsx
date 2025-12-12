import React, { useEffect, useMemo, useRef } from "react";
import {
  TextInput,
  StyleSheet,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
} from "react-native";

import { Stack } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { radii, spacing } from "@common/designSystem/tokens";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
};

const OtpInput: React.FC<Props> = ({
  value,
  onChange,
  length = 6,
  autoFocus = true,
}) => {
  const { colors } = useAppTheme();
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const chars = useMemo(
    () => value.split("").slice(0, length),
    [value, length]
  );

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^\d]/g, "");
    const nextChars = chars.slice();
    if (!sanitized) {
      nextChars[index] = "";
    } else {
      const nextChar = sanitized[sanitized.length - 1];
      nextChars[index] = nextChar;
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
    onChange(nextChars.join(""));
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Stack direction="row" justify="center" gap="sm">
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          value={chars[idx] ?? ""}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
            Boolean(chars[idx]) && {
              borderColor: colors.primary,
              backgroundColor: colors.mutedSurface,
            },
          ]}
          onChangeText={(text) => handleChange(text, idx)}
          onKeyPress={(event) => handleKeyPress(event, idx)}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={1}
          textAlign="center"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={false}
        />
      ))}
    </Stack>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  input: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.2,
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: spacing.xs,
  },
});
