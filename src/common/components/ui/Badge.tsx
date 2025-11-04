import React from "react";
import { Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  muted?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const Badge: React.FC<Props> = ({ children, muted, style, textStyle }) => {
  return (
    <View style={[styles.badge, muted ? styles.muted : styles.default, style]}>
      <Text
        style={[
          styles.txt,
          muted ? styles.mutedTxt : styles.defaultTxt,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: "100%",
  },
  default: { backgroundColor: "#F3F4F6" },
  defaultTxt: { color: "#111827" },
  muted: { backgroundColor: "#EEF2FF" },
  mutedTxt: { color: "#3730A3" },
  txt: { fontSize: 12 },
});

export default Badge;
