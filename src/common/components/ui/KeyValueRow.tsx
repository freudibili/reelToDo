import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Stack, Text } from "@common/designSystem";

type Props = { label: string; value: string; labelWidth?: number };

const KeyValueRow: React.FC<Props> = ({ label, value, labelWidth = 140 }) => {
  const { t } = useTranslation();
  const displayValue = value || t("labels.notAvailable");

  return (
    <Stack direction="row" align="flex-start" gap="sm" style={styles.row}>
      <Text variant="bodySmall" tone="muted" style={{ width: labelWidth }}>
        {label}
      </Text>
      <Text variant="body" style={styles.value}>
        {displayValue}
      </Text>
    </Stack>
  );
};

const styles = StyleSheet.create({
  row: { paddingVertical: 8 },
  value: { flex: 1 },
});

export default KeyValueRow;
