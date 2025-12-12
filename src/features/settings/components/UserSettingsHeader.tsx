import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import { Avatar, Icon } from "react-native-paper";

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
  const isLight = mode === "light";

  const cardBackground = isLight ? colors.text : colors.favoriteContrast;
  const cardTextColor = isLight ? colors.favoriteContrast : colors.background;

  const avatarBackground = isLight ? colors.primarySurface : colors.lightGray;
  const avatarBorder = isLight ? colors.primaryBorder : colors.border;
  const avatarIconColor = colors.primary;

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
            style={[
              styles.avatar,
              { backgroundColor: avatarBackground, borderColor: avatarBorder },
            ]}
            color={avatarIconColor}
          />
          <Box style={styles.info} gap={4}>
            <Text variant="eyebrow" tone="inverse">
              {t("settings:items.profile")}
            </Text>
            <Text variant="title3" style={{ color: cardTextColor }}>
              {name}
            </Text>
            {email ? (
              <Text
                variant="bodySmall"
                style={{ color: cardTextColor, opacity: 0.82 }}
              >
                {email}
              </Text>
            ) : null}
            {address ? (
              <Text
                variant="bodySmall"
                style={{ color: cardTextColor, opacity: 0.82 }}
              >
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
  avatar: {
    borderWidth: StyleSheet.hairlineWidth,
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
