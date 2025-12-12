import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Box, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  name: string;
  email?: string;
  address?: string;
  onPress?: () => void;
}

const UserSettingsHeader: React.FC<Props> = ({
  name,
  email,
  address,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();

  // Invert the card background relative to the app theme:
  // - On light mode: use a dark background (use a theme text color) and light text
  // - On dark mode: use a lighter surface (if available) and dark text
  const isLight = mode === "light";
  const cardBackground = isLight
    ? colors.text
    : // prefer a light background when in dark mode (invert)
      colors.favoriteContrast;

  // Choose readable text color for the card depending on the computed background
  const cardTextColor = isLight ? colors.favoriteContrast : colors.lightGray;

  const avatarBackground = isLight ? colors.overlay : colors.lightGray;
  const avatarIconColor = isLight ? cardTextColor : cardBackground;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.container}>
      <Card
        variant="outlined"
        padding="md"
        radius="lg"
        style={{ backgroundColor: cardBackground }}
      >
        <Stack direction="row" align="center" gap="md">
          <Avatar.Icon
            size={56}
            icon="account-circle"
            style={[{ backgroundColor: avatarBackground }]}
            color={avatarIconColor}
          />
          <Box style={styles.info} gap={4}>
            <Text variant="eyebrow" tone="muted">
              {t("settings:items.profile")}
            </Text>
            <Text variant="title3" style={{ color: cardTextColor }}>
              {name}
            </Text>
            {email ? (
              <Text variant="bodySmall" style={{ color: colors.secondaryText }}>
                {email}
              </Text>
            ) : null}
            {address ? (
              <Text variant="bodySmall" style={{ color: colors.secondaryText }}>
                {address}
              </Text>
            ) : null}
          </Box>
          <Icon source="chevron-right" size={22} color={cardTextColor} />
        </Stack>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    marginTop: 2,
  },
});

export default UserSettingsHeader;
