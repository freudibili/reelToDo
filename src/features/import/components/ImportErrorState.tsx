import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import { Box, Button, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type ImportErrorStateProps = {
  message?: string | null;
  onGoHome: () => void;
};

const ImportErrorState: React.FC<ImportErrorStateProps> = ({
  message,
  onGoHome,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Card padding="lg" radius="xl" shadow="md" variant="outlined">
      <Stack align="center" gap="sm">
        <Box
          padding="md"
          rounded="pill"
          background={colors.overlay}
          style={styles.iconWrapper}
        >
          <Icon source="emoticon-happy-outline" size={30} color={colors.primary} />
        </Box>

        <Text variant="title2" weight="700" align="center">
          {t("import:errorState.title")}
        </Text>
        <Text variant="body" tone="muted" align="center">
          {t("import:errorState.description")}
        </Text>

        {message ? (
          <Box
            padding="md"
            rounded="md"
            border
            background={colors.card}
            style={styles.fullWidth}
          >
            <Text variant="eyebrow" tone="muted">
              {t("import:errorState.reasonLabel")}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {message}
            </Text>
          </Box>
        ) : null}

        <Button
          label={t("import:errorState.homeCta")}
          onPress={onGoHome}
          variant="primary"
          shadow="sm"
          icon={
            <Icon
              source="home-variant-outline"
              size={18}
              color={colors.favoriteContrast}
            />
          }
        />
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: "stretch",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImportErrorState;
