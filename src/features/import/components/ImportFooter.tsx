import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Button, Stack } from "@common/designSystem";

type ImportFooterProps = {
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
};

const ImportFooter: React.FC<ImportFooterProps> = ({
  disabled,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      justify="space-between"
      align="center"
      gap="sm"
      style={styles.actionsRow}
    >
      <Button
        label={t("import:details.cancel")}
        variant="ghost"
        onPress={onCancel}
      />
      <Button
        label={t("common:buttons.save")}
        variant="primary"
        onPress={onSave}
        disabled={disabled}
        shadow="sm"
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    paddingVertical: 20,
  },
});

export default ImportFooter;
