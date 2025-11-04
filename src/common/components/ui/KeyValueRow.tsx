import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { label: string; value: string; labelWidth?: number };

const KeyValueRow: React.FC<Props> = ({ label, value, labelWidth = 140 }) => {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { width: labelWidth }]}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  label: { color: "#6B7280" },
  value: { flex: 1, color: "#111827" },
});

export default KeyValueRow;
