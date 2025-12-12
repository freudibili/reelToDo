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
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ marginBottom: 18 }}>
      <Card variant="outlined" padding="md" radius="lg">
        <Stack direction="row" align="center" gap="md">
          <Avatar.Icon
            size={56}
            icon="account-circle"
            style={[styles.avatar, { backgroundColor: colors.overlay }]}
            color={colors.secondaryText}
          />
          <Box style={styles.info} gap={4}>
            <Text variant="eyebrow" tone="muted">
              {t("settings:items.profile")}
            </Text>
            <Text variant="title3">{name}</Text>
            {email ? (
              <Text variant="bodySmall" tone="muted">
                {email}
              </Text>
            ) : null}
            {address ? (
              <Text variant="bodySmall" tone="muted">
                {address}
              </Text>
            ) : null}
          </Box>
          <Icon source="chevron-right" size={22} color={colors.secondaryText} />
        </Stack>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  avatar: {},
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
