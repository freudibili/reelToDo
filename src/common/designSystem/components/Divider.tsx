import React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";

import { useAppTheme } from "../../theme/appTheme";

const Divider: React.FC<ViewProps> = ({ style, ...rest }) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.divider, { backgroundColor: colors.border }, style]}
      {...rest}
    />
  );
};

export default Divider;

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
  },
});
