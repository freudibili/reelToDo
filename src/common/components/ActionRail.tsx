import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import ActionPill from "./ActionPill";

export interface ActionRailItem {
  key: string;
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}

interface ActionRailProps {
  actions: ActionRailItem[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

const ActionRail: React.FC<ActionRailProps> = ({
  actions,
  style,
  contentStyle,
}) => (
  <ScrollView
    horizontal
    scrollEnabled
    nestedScrollEnabled
    showsHorizontalScrollIndicator={false}
    overScrollMode="never"
    style={[styles.scroll, style]}
    contentContainerStyle={[styles.actionsRail, contentStyle]}
  >
    {actions.map((action, idx) => (
      <ActionPill
        key={action.key}
        label={action.label}
        icon={action.icon}
        iconColor={action.iconColor}
        onPress={action.onPress}
        disabled={action.disabled}
        tone={action.tone}
        style={idx === actions.length - 1 ? undefined : styles.actionMargin}
      />
    ))}
  </ScrollView>
);

export default ActionRail;

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    flexGrow: 0,
  },
  actionsRail: {
    paddingLeft: 4,
    paddingRight: 12,
  },
  actionMargin: { marginRight: 10 },
});
