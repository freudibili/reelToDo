import React from "react";
import { Icon } from "react-native-paper";

import GradientButton from "@common/designSystem/components/GradientButton";
import { useAppTheme } from "@common/theme/appTheme";

type MagicLinkButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const MagicLinkButton: React.FC<MagicLinkButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const { colors } = useAppTheme();

  return (
    <GradientButton
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={
        <Icon
          source="star-four-points"
          size={18}
          color={colors.favoriteContrast}
        />
      }
    />
  );
};

export default MagicLinkButton;
