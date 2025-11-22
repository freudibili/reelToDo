import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ActionPill from "@common/components/ActionPill";

type Props = {
  icon: string;
  value: string;
};

const InfoRow: React.FC<Props> = ({ icon, value }) => (
  <View style={styles.infoRow}>
    <ActionPill
      icon={icon}
      label=""
      onPress={() => {}}
      style={styles.infoIcon}
      textStyle={styles.hiddenText}
    />
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default InfoRow;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
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
    color: "#0f172a",
    flex: 1,
  },
  hiddenText: { display: "none" },
});
