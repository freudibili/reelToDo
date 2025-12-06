import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";

interface FavoriteHeartProps {
  selected: boolean;
  size?: number;
}

const FavoriteHeart: React.FC<FavoriteHeartProps> = ({
  selected,
  size = 20,
}) => {
  const { colors } = useAppTheme();
  const activeColor = colors.favorite;
  const inactiveFill = "rgba(0,0,0,0.45)";
  const outlineColor = colors.favoriteContrast;

  if (selected) {
    return <Icon source="heart" size={size} color={activeColor} />;
  }

  return (
    <View style={[styles.layer, { width: size, height: size }]}>
      <View style={styles.overlay}>
        <Icon source="heart" size={size} color={inactiveFill} />
      </View>
      <View style={styles.overlay}>
        <Icon source="heart-outline" size={size} color={outlineColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FavoriteHeart;
