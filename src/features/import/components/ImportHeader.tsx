import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";

interface ImportHeaderProps {
  title: string;
  subtitle: string;
  showText?: boolean;
}

const ImportHeader: React.FC<ImportHeaderProps> = ({
  title,
  subtitle,
  showText = true,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0ea5e9", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroIcon}
      >
        <Icon source="link-variant" size={32} color="#fff" />
      </LinearGradient>
      {showText ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});

export default ImportHeader;
