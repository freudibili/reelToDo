import React from "react";

import { Box, Card, Stack, Text } from "@common/designSystem";

interface Props {
  title?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <Stack gap="xs" style={styles.section}>
      {title ? (
        <Text variant="eyebrow" tone="muted">
          {title}
        </Text>
      ) : null}
      <Card variant="outlined" padding="lg" radius="lg">
        <Box gap={8}>{children}</Box>
      </Card>
    </Stack>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
});

export default SettingsSection;
