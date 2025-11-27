import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ActionPill from "@common/components/ActionPill";
import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  icon: string;
  value: string;
};

const InfoRow: React.FC<Props> = ({ icon, value }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.infoRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <ActionPill
        icon={icon}
        label=""
        onPress={() => {}}
        style={styles.infoIcon}
        textStyle={styles.hiddenText}
      />
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

export default InfoRow;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoIcon: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 32,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  hiddenText: { display: "none" },
});
