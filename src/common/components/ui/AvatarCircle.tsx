import React from "react";
import { View, Image, StyleSheet, ImageStyle, ViewStyle, TextStyle } from "react-native";

import { Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  size?: number;
  initials: string;
  uri?: string;
  bg?: string;
  color?: string;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
};

const AvatarCircle: React.FC<Props> = ({
  size = 64,
  initials,
  uri,
  bg,
  color,
  style,
  imageStyle,
  textStyle,
}) => {
  const { colors } = useAppTheme();
  const radius = size / 2;
  const background = bg ?? colors.accentSurface;
  const textColor = color ?? colors.accent;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: background,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.img,
            { width: size, height: size, borderRadius: radius },
            imageStyle,
          ]}
        />
      ) : (
        <Text
          variant="title3"
          weight="700"
          style={[{ color: textColor, fontSize: Math.max(18, size * 0.34) }, textStyle]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  img: { resizeMode: "cover" },
});

export default AvatarCircle;
