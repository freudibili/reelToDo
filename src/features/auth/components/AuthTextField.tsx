import React, { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { Input } from "@common/designSystem";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

const AuthTextField = forwardRef<TextInput, Props>(
  ({ label, hint, style, ...inputProps }, ref) => {
    return (
      <Input
        ref={ref}
        label={label}
        hint={hint}
        style={style}
        {...inputProps}
      />
    );
  }
);

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;
