import React from "react";
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

import { useAppTheme } from "../../theme/appTheme";
import { typography, type TextVariant } from "../tokens";

type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "accent"
  | "danger"
  | "success"
  | "inverse";

type Props = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
  uppercase?: boolean;
  italic?: boolean;
};

const Text = React.forwardRef<RNText, Props>(
  (
    {
      children,
      variant = "body",
      tone = "default",
      align,
      weight,
      uppercase = false,
      italic = false,
      style,
      ...rest
    },
    ref
  ) => {
    const { colors, mode } = useAppTheme();

    const colorMap: Record<TextTone, string> = {
      default: colors.text,
      muted: colors.secondaryText,
      subtle: colors.mutedText,
      primary: colors.primary,
      accent: colors.accent,
      danger: colors.danger,
      success: colors.success,
      inverse: mode === "dark" ? colors.surface : colors.background,
    };

    return (
      <RNText
        ref={ref}
        style={[
          typography[variant],
          {
            color: colorMap[tone],
            textAlign: align,
            fontWeight: weight,
            textTransform: uppercase ? "uppercase" : undefined,
            fontStyle: italic ? "italic" : undefined,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = "Text";

export type { TextTone };
export default Text;
