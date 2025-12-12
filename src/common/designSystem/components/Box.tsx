import React from "react";
import { View, type ViewProps, type ViewStyle, StyleSheet } from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import {
  getShadowStyle,
  spacing,
  resolveRadius,
  type RadiusValue,
  type ShadowLevel,
  type SpacingValue,
} from "../tokens";

type BoxProps = ViewProps & {
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
  rounded?: RadiusValue;
  border?: boolean;
  borderColor?: string;
  background?: string;
  gap?: number;
  direction?: ViewStyle["flexDirection"];
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  flex?: number;
  center?: boolean;
  shadow?: ShadowLevel | boolean;
  height?: number;
  width?: number;
};

const Box: React.FC<BoxProps> = ({
  children,
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
  rounded,
  border = false,
  borderColor,
  background,
  gap,
  direction,
  align,
  justify,
  flex,
  center = false,
  shadow,
  style,
  height,
  width,
  ...rest
}) => {
  const { colors, mode } = useAppTheme();
  const space = (value: SpacingValue) =>
    typeof value === "number"
      ? value
      : value !== undefined
        ? (spacing[value] ?? 0)
        : undefined;
  const resolvedGap = gap !== undefined ? space(gap) : undefined;

  const resolvedRadius = resolveRadius(rounded);
  const baseStyle: ViewStyle = {
    height: typeof height === "number" ? height : undefined,
    width: typeof width === "number" ? width : undefined,
    padding: space(padding),
    paddingHorizontal: space(paddingHorizontal),
    paddingVertical: space(paddingVertical),
    paddingTop: space(paddingTop),
    paddingBottom: space(paddingBottom),
    paddingRight: space(paddingRight),
    margin: space(margin),
    marginHorizontal: space(marginHorizontal),
    marginVertical: space(marginVertical),
    marginTop: space(marginTop),
    marginBottom: space(marginBottom),
    marginLeft: space(marginLeft),
    marginRight: space(marginRight),
    borderRadius: resolvedRadius,
    backgroundColor: background,
    gap: resolvedGap,
    flex,
    flexDirection: direction,
    alignItems: center ? "center" : align,
    justifyContent: center ? "center" : justify,
    borderWidth: border ? StyleSheet.hairlineWidth : undefined,
    borderColor: border ? (borderColor ?? colors.border) : borderColor,
  };

  const shadowStyle =
    shadow === true
      ? getShadowStyle(mode, "md")
      : shadow
        ? getShadowStyle(mode, shadow)
        : undefined;

  return (
    <View style={[baseStyle, shadowStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export default Box;
