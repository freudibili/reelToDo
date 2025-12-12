import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";

import { Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type ImportHeaderProps = {
  title: string;
  subtitle: string;
  showText?: boolean;
};

const ImportHeader: React.FC<ImportHeaderProps> = ({
  title,
  subtitle,
  showText = true,
}) => {
  const { colors } = useAppTheme();

  return (
    <Stack align="center" gap="xs" style={styles.container}>
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroIcon}
      >
        <Icon
          source="link-variant"
          size={32}
          color={colors.favoriteContrast}
        />
      </LinearGradient>

      {showText ? (
        <>
          <Text variant="title2" weight="700" align="center">
            {title}
          </Text>
          <Text variant="body" tone="muted" align="center">
            {subtitle}
          </Text>
        </>
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ImportHeader;
