import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@common/theme/appTheme";
import { GradientButton } from "@common/designSystem";

interface ManualLinkCardProps {
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
}

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
  const gradientColors = [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {helperText ? (
          <Text style={[styles.helper, { color: colors.secondaryText }]}>
            {helperText}
          </Text>
        ) : null}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          editable={!loading}
        />
        <Pressable
          onPress={onAnalyze}
          disabled={!canAnalyze}
          style={({ pressed }) => [
            styles.analyzePressable,
            {
              opacity: !canAnalyze ? 0.5 : pressed ? 0.9 : 1,
            },
          ]}
        >
          <GradientButton
            label={loading ? analyzingLabel : analyzeLabel}
            icon={<Icon source="link-plus" size={16} color="#fff" />}
            onPress={onAnalyze}
            gradient={gradientColors}
            loading={loading}
            size="sm"
            style={styles.analyzeButton}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  helper: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  analyzePressable: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  analyzeButton: {
    borderRadius: 14,
  },
});

export default ManualLinkCard;
