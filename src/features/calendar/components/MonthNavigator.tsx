import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";

interface Props {
  label: string;
  subtitle: string;
  onPrev: () => void;
  onNext: () => void;
}

const MonthNavigator: React.FC<Props> = ({ label, subtitle, onPrev, onNext }) => (
  <View style={styles.monthHeader}>
    <Pressable onPress={onPrev} style={styles.navButton} hitSlop={8}>
      <Icon source="chevron-left" size={24} color="#0f172a" />
    </Pressable>
    <View style={styles.monthLabelBlock}>
      <Text style={styles.monthTitle}>{label}</Text>
      <Text style={styles.monthSubtitle}>{subtitle}</Text>
    </View>
    <Pressable onPress={onNext} style={styles.navButton} hitSlop={8}>
      <Icon source="chevron-right" size={24} color="#0f172a" />
    </Pressable>
  </View>
);

export default MonthNavigator;

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  monthLabelBlock: {
    alignItems: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  monthSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569",
    textTransform: "capitalize",
  },
});
