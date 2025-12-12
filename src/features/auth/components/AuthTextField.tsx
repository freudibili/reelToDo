import React, { forwardRef, useEffect, useState } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { Input } from "@common/designSystem";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onRightIconPress?: () => void;
};

const AuthTextField = forwardRef<TextInput, Props>(
  (
    { label, hint, style, secureTextEntry, rightIcon, onRightIconPress, ...inputProps },
    ref
  ) => {
    const [isSecure, setIsSecure] = useState<boolean>(!!secureTextEntry);
    const showPasswordToggle = !!secureTextEntry && !rightIcon;

    useEffect(() => {
      setIsSecure(!!secureTextEntry);
    }, [secureTextEntry]);

    return (
      <Input
        ref={ref}
        label={label}
        hint={hint}
        style={style}
        secureTextEntry={showPasswordToggle ? isSecure : secureTextEntry}
        rightIcon={
          showPasswordToggle
            ? isSecure
              ? "eye-outline"
              : "eye-off-outline"
            : rightIcon
        }
        onRightIconPress={
          showPasswordToggle ? () => setIsSecure((prev) => !prev) : onRightIconPress
        }
        {...inputProps}
      />
    );
  }
);

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;
