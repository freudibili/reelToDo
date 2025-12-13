import React from "react";
import { type ViewProps, type ViewStyle } from "react-native";

import Box from "./Box";
import {
  resolveSpace,
  type RadiusValue,
  type ShadowLevel,
  type SpacingValue,
} from "../tokens";

type StackProps = ViewProps & {
  direction?: ViewStyle["flexDirection"];
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  gap?: SpacingValue;
  wrap?: boolean;
  fullWidth?: boolean;
  height?: number;
  width?: number;
  rounded?: RadiusValue;
  background?: string;
  flex?: number;
  border?: boolean;
  borderColor?: string;
  shadow?: ShadowLevel | boolean;
  center?: boolean;
  padding?: SpacingValue;
  paddingHorizontal?: SpacingValue;
  paddingVertical?: SpacingValue;
  paddingTop?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  paddingRight?: SpacingValue;
  margin?: SpacingValue;
  marginHorizontal?: SpacingValue;
  marginVertical?: SpacingValue;
  marginTop?: SpacingValue;
  marginBottom?: SpacingValue;
  marginLeft?: SpacingValue;
  marginRight?: SpacingValue;
};

const Stack: React.FC<StackProps> = ({
  children,
  direction = "column",
  align,
  justify,
  gap = "md",
  wrap = false,
  fullWidth = false,
  height,
  width,
  rounded,
  background,
  flex,
  border,
  borderColor,
  shadow,
  center,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  style,
  ...rest
}) => {
  return (
    <Box
      direction={direction}
      align={align}
      justify={justify}
      height={height}
      width={width}
      rounded={rounded}
      background={background}
      flex={flex}
      border={border}
      borderColor={borderColor}
      shadow={shadow}
      center={center}
      padding={padding}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      margin={margin}
      marginHorizontal={marginHorizontal}
      marginVertical={marginVertical}
      marginTop={marginTop}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
      marginRight={marginRight}
      gap={resolveSpace(gap)}
      style={[
        fullWidth ? { width: "100%" } : undefined,
        wrap ? { flexWrap: "wrap" } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Stack;
