import React from "react";

import { Button } from "@common/designSystem";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
};

const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
}) => {
  return (
    <Button
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      variant={variant === "secondary" ? "secondary" : variant === "ghost" ? "ghost" : "primary"}
      icon={icon}
      fullWidth
    />
  );
};

export default AuthButton;
