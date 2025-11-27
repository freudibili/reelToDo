import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  GestureResponderEvent,
} from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors } = useAppTheme();
  const titleStyle = tone === "danger" ? { color: colors.danger } : undefined;
  const iconColor = tone === "danger" ? colors.danger : colors.primary;
  const iconBg =
    tone === "danger" ? "rgba(248,113,113,0.12)" : colors.overlay;

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
        <Text style={[styles.title, { color: colors.text }, titleStyle]}>
          {title}
        </Text>
        {description ? (
          <Text
            style={[styles.description, { color: colors.secondaryText }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {right}
        {onPress ? (
          <Icon
            source="chevron-right"
            size={20}
            color={colors.secondaryText}
          />
        ) : null}
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
    fontWeight: "600",
    fontSize: 16,
  },
  description: {
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
