import React from "react";
import { type TextInputProps } from "react-native";

import { Input } from "@common/designSystem";

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
  return (
    <Input
      label={label}
      hint={helperText}
      editable={editable}
      {...inputProps}
    />
  );
};

export default ProfileTextField;
