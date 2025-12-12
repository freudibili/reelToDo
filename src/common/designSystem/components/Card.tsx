import React from "react";
import { StyleSheet, type ViewProps } from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import {
  getShadowStyle,
  radii,
  resolveRadius,
  resolveSpace,
  type RadiusValue,
  type ShadowLevel,
  type SpacingValue,
} from "../tokens";
import Box from "./Box";

type CardVariant = "elevated" | "outlined" | "ghost" | "muted";

type Props = ViewProps & {
  padding?: SpacingValue;
  radius?: RadiusValue;
  variant?: CardVariant;
  shadow?: ShadowLevel | false;
};

const Card: React.FC<Props> = ({
  children,
  padding = "lg",
  radius = "lg",
  variant = "elevated",
  shadow,
  style,
  ...rest
}) => {
  const { colors, mode } = useAppTheme();
  const background =
    variant === "ghost" ? "transparent" : variant === "muted" ? colors.card : colors.surface;
  const border =
    variant === "outlined" ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : undefined;
  const showShadow = shadow === false ? false : variant === "elevated" ? shadow ?? "md" : false;

  return (
    <Box
      padding={padding}
      rounded={resolveRadius(radius) ?? radii.lg}
      background={background}
      style={[border, showShadow ? getShadowStyle(mode, showShadow, colors.text) : undefined, style]}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Card;
