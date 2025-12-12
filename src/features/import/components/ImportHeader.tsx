import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroIcon}
      >
        <Icon source="link-variant" size={32} color="#fff" />
      </LinearGradient>
      {showText ? (
        <>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {subtitle}
          </Text>
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
    textAlign: "center",
    paddingHorizontal: 12,
  },
});

export default ImportHeader;
