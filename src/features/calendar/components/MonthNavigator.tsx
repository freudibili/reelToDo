import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Box, IconButton, Stack, Text, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  label: string;
  subtitle: string;
  onPrev: () => void;
  onNext: () => void;
}

const MonthNavigator: React.FC<Props> = ({
  label,
  subtitle,
  onPrev,
  onNext,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Box
      background={colors.card}
      border
      rounded="lg"
      padding="md"
      style={styles.container}
    >
      <Stack direction="row" align="center" justify="space-between" gap="sm">
        <IconButton
          icon="chevron-left"
          variant="outline"
          tone="primary"
          size={44}
          onPress={onPrev}
          accessibilityLabel={t("activities:calendar.previousMonth")}
        />

        <Stack align="center" gap="xxs" style={styles.labelBlock}>
          <Text variant="title2">{label}</Text>
          <Text variant="caption" tone="subtle">
            {subtitle}
          </Text>
        </Stack>

        <IconButton
          icon="chevron-right"
          variant="outline"
          tone="primary"
          size={44}
          onPress={onNext}
          accessibilityLabel={t("activities:calendar.nextMonth")}
        />
      </Stack>
    </Box>
  );
};

export default MonthNavigator;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  labelBlock: {
    flex: 1,
  },
});
