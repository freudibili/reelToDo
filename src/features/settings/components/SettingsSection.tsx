import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 2,
    overflow: "hidden",
  },
});

export default SettingsSection;
