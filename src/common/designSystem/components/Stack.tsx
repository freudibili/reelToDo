import React from "react";
import { type ViewProps, type ViewStyle } from "react-native";

import Box from "./Box";
import { resolveSpace, type SpacingValue } from "../tokens";

type StackProps = ViewProps & {
  direction?: ViewStyle["flexDirection"];
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  gap?: SpacingValue;
  wrap?: boolean;
  fullWidth?: boolean;
};

const Stack: React.FC<StackProps> = ({
  children,
  direction = "column",
  align,
  justify,
  gap = "md",
  wrap = false,
  fullWidth = false,
  style,
  ...rest
}) => {
  return (
    <Box
      direction={direction}
      align={align}
      justify={justify}
      gap={resolveSpace(gap)}
      style={[fullWidth ? { width: "100%" } : undefined, wrap ? { flexWrap: "wrap" } : undefined, style]}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Stack;
