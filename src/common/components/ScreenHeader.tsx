import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { IconButton, Stack, Text } from "@common/designSystem";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBackPress?: () => void;
  right?: React.ReactNode;
  compact?: boolean;
  alignLeftWhenNoBack?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  onBackPress,
  right,
  compact = false,
  alignLeftWhenNoBack = true,
}) => {
  const { t } = useTranslation();
  const showPlaceholder = !onBackPress && !alignLeftWhenNoBack;

  return (
    <Stack
      direction="row"
      align="center"
      gap="md"
      style={compact ? styles.headerCompact : styles.header}
    >
      {onBackPress ? (
        <IconButton
          icon="chevron-left"
          size={40}
          variant="subtle"
          tone="primary"
          onPress={onBackPress}
          accessibilityLabel={t("accessibility.goBack")}
        />
      ) : showPlaceholder ? (
        <View style={styles.backPlaceholder} />
      ) : null}

      <Stack gap="xxs" style={styles.headerText}>
        {eyebrow ? (
          <Text variant="eyebrow" tone="muted">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          variant={compact ? "title2" : "luxeTitle"}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="bodySmall"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        ) : null}
      </Stack>

      <View style={styles.headerRight}>{right}</View>
    </Stack>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerCompact: {
    marginBottom: 12,
  },
  backPlaceholder: {
    width: 40,
  },
  headerText: { flex: 1 },
  eyebrow: {
    marginTop: 2,
  },
  headerRight: { minWidth: 40, alignItems: "flex-end" },
});

export default ScreenHeader;
