import React from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Button, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type ProcessingStateCardProps = {
  mode: "processing" | "failed";
  message?: string | null;
  loading?: boolean;
  onRetry?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  showAnimation?: boolean;
};

const processingAnimation = require("../../../../assets/animations/travel-is-fun.json");

const ProcessingStateCard: React.FC<ProcessingStateCardProps> = ({
  mode,
  message,
  loading = false,
  onRetry,
  onSecondary,
  secondaryLabel,
  showAnimation = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const isProcessing = mode === "processing";
  const isWeb = Platform.OS === "web";

  const indicator = isProcessing ? (
    showAnimation && !isWeb ? (
      <LottieView
        source={processingAnimation}
        autoPlay
        loop
        style={styles.animation}
      />
    ) : (
      <ActivityIndicator color={colors.primary} />
    )
  ) : (
    <Icon source="alert-circle" size={22} color={colors.danger} />
  );

  const title = isProcessing
    ? t("import:processing.title")
    : t("import:processing.failedTitle");
  const subtitle =
    message ||
    (isProcessing
      ? t("import:processing.subtitle")
      : t("import:processing.failedSubtitle"));
  const hint = isProcessing
    ? t("import:processing.hint")
    : t("import:processing.failedSubtitle");

  return (
    <Card padding="lg" radius="lg" variant="outlined" shadow="sm">
      <Stack gap="sm">
        <Stack direction="row" align="center" justify="space-between" gap="sm">
          <Stack gap="xs" style={styles.flex}>
            <Text variant="headline" weight="700">
              {title}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {subtitle}
            </Text>
          </Stack>
          {indicator}
        </Stack>

        <Text variant="caption" tone="muted">
          {hint}
        </Text>

        {!isProcessing ? (
          <Stack direction="row" gap="sm" wrap>
            {onRetry ? (
              <Button
                label={
                  loading
                    ? t("import:processing.retrying")
                    : t("import:processing.retry")
                }
                onPress={onRetry}
                disabled={loading}
                loading={loading}
                variant="primary"
              />
            ) : null}
            {onSecondary && secondaryLabel ? (
              <Button
                label={secondaryLabel}
                onPress={onSecondary}
                variant="outline"
              />
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create({
  animation: {
    width: 72,
    height: 72,
  },
  flex: {
    flex: 1,
  },
});

export default ProcessingStateCard;
