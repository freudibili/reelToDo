import React from "react";
import { type TextStyle, type ViewStyle } from "react-native";

import { Badge as DesignSystemBadge } from "@common/designSystem";

type Props = {
  children: React.ReactNode;
  muted?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const Badge: React.FC<Props> = ({ children, muted, style, textStyle }) => {
  return (
    <DesignSystemBadge muted={muted} style={style} textStyle={textStyle}>
      {children}
    </DesignSystemBadge>
  );
};

export default Badge;
