import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";
import { useTranslation } from "react-i18next";

type Props = {
  onPress: () => void;
  label?: string;
};

const SuggestionPill: React.FC<Props> = ({ onPress, label }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("activities:details.suggestDateCta");

  return (
    <Pressable style={styles.container} onPress={onPress} hitSlop={8}>
      <Icon source={"pencil"} size={14} color={colors.accent} />
      <Text style={[styles.label, { color: colors.accent }]} numberOfLines={2}>
        {resolvedLabel}
      </Text>
    </Pressable>
  );
};

export default SuggestionPill;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textAlign: "center",
    maxWidth: 100,
    flexShrink: 1,
  },
});
