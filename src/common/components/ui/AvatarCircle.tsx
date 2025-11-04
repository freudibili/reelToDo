import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  TextStyle,
} from "react-native";

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
  bg = "#DBEAFE",
  color = "#1E3A8A",
  style,
  imageStyle,
  textStyle,
}) => {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
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
          style={[
            styles.txt,
            { color, fontSize: Math.max(18, size * 0.34) },
            textStyle,
          ]}
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
  txt: { fontWeight: "700" as const },
});

export default AvatarCircle;
