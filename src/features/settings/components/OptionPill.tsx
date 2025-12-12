import React from "react";

import { Chip } from "@common/designSystem";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

const OptionPill: React.FC<Props> = ({ label, selected = false, onPress }) => {
  return (
    <Chip
      label={label}
      selected={selected}
      tone="primary"
      onPress={onPress}
    />
  );
};

export default OptionPill;
