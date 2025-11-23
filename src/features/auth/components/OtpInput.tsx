import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
} from "react-native";

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
    <View style={styles.container}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          value={chars[idx] ?? ""}
          style={[
            styles.input,
            Boolean(chars[idx]) && styles.inputFilled,
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
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  inputFilled: {
    borderColor: "#2563eb",
  },
});
