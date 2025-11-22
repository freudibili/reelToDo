import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  GestureResponderEvent,
} from "react-native";
import { Icon } from "react-native-paper";

type Tone = "default" | "danger";

interface Props {
  title: string;
  description?: string;
  icon?: string;
  onPress?: (event: GestureResponderEvent) => void;
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
  const iconColor = tone === "danger" ? "#b91c1c" : "#0f172a";
  const iconBg =
    tone === "danger" ? "rgba(185,28,28,0.08)" : "rgba(15,23,42,0.06)";

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconPill, { backgroundColor: iconBg }]}>
        <Icon source={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {right}
        {onPress ? <Icon source="chevron-right" size={20} color="#94a3b8" /> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 16,
  },
  dangerTitle: {
    color: "#b91c1c",
  },
  description: {
    color: "#6b7280",
    marginTop: 2,
    fontSize: 13,
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 8,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SettingsListItem;
