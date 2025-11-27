import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  title?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.title, { color: colors.secondaryText }]}>
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
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
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
    overflow: "hidden",
  },
});

export default SettingsSection;
