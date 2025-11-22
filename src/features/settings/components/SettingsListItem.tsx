import React from "react";
import { View, StyleSheet } from "react-native";
import { List } from "react-native-paper";

type Tone = "default" | "danger";

interface Props {
  title: string;
  description?: string;
  icon?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  tone?: Tone;
}

const SettingsListItem: React.FC<Props> = ({
  title,
  description,
  icon = "chevron-right",
  onPress,
  right,
  tone = "default",
}) => {
  const titleStyle = tone === "danger" ? styles.dangerTitle : undefined;
  const iconColor = tone === "danger" ? "#b91c1c" : "#111827";

  const renderRight = () => {
    if (!right && !onPress) return null;
    return (
      <View style={styles.right}>
        {right}
        {onPress ? <List.Icon icon="chevron-right" color="#9ca3af" /> : null}
      </View>
    );
  };

  return (
    <List.Item
      title={title}
      description={description}
      titleStyle={[styles.title, titleStyle]}
      descriptionNumberOfLines={2}
      left={(props) => (
        <List.Icon {...props} icon={icon} color={iconColor} />
      )}
      right={renderRight}
      style={styles.item}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 6,
  },
  title: {
    color: "#111827",
    fontWeight: "600",
  },
  dangerTitle: {
    color: "#b91c1c",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 4,
  },
});

export default SettingsListItem;
