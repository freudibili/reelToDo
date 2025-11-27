import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  label: string;
  subtitle: string;
  onPrev: () => void;
  onNext: () => void;
}

const MonthNavigator: React.FC<Props> = ({
  label,
  subtitle,
  onPrev,
  onNext,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.monthHeader,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPress={onPrev}
        style={[styles.navButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        hitSlop={8}
      >
        <Icon source="chevron-left" size={24} color={colors.primary} />
      </Pressable>
      <View style={styles.monthLabelBlock}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.monthSubtitle, { color: colors.secondaryText }]}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        onPress={onNext}
        style={[styles.navButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        hitSlop={8}
      >
        <Icon source="chevron-right" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export default MonthNavigator;

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  monthLabelBlock: {
    alignItems: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  monthSubtitle: {
    marginTop: 4,
    fontSize: 12,
    textTransform: "capitalize",
  },
});
