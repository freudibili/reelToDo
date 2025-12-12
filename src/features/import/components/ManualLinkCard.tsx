import React from "react";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import { Card, GradientButton, Input, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type ManualLinkCardProps = {
  value: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  canAnalyze: boolean;
  label: string;
  placeholder: string;
  analyzingLabel: string;
  analyzeLabel: string;
  helperText?: string;
};

const ManualLinkCard: React.FC<ManualLinkCardProps> = ({
  value,
  onChange,
  onAnalyze,
  loading,
  canAnalyze,
  label,
  placeholder,
  analyzingLabel,
  analyzeLabel,
  helperText,
}) => {
  const { colors } = useAppTheme();
  const actionLabel = loading ? analyzingLabel : analyzeLabel;

  return (
    <Card padding="lg" radius="xl" shadow="md" style={styles.card}>
      <Stack gap="sm">
        <Stack direction="row" align="center" justify="space-between" gap="sm">
          <Text variant="headline" weight="700">
            {label}
          </Text>
          {helperText ? (
            <Text variant="caption" tone="muted" align="right">
              {helperText}
            </Text>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          align="center"
          gap="sm"
          wrap
          style={styles.inputRow}
        >
          <Input
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            containerStyle={styles.inputContainer}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            editable={!loading}
          />
          <GradientButton
            label={actionLabel}
            icon={
              <Icon
                source="link-plus"
                size={18}
                color={colors.favoriteContrast}
              />
            }
            onPress={onAnalyze}
            loading={loading}
            disabled={!canAnalyze}
            size="sm"
            style={styles.analyzeButton}
          />
        </Stack>
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
  },
  input: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    minWidth: 160,
  },
  inputRow: {
    width: "100%",
  },
  analyzeButton: {
    flexShrink: 0,
    minWidth: 120,
    alignSelf: "flex-start",
  },
});

export default ManualLinkCard;
