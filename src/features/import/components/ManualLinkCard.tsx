import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Icon } from "react-native-paper";

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
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.input}
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
            pressed && styles.analyzePressed,
            !canAnalyze && styles.analyzeDisabled,
          ]}
        >
          <View style={styles.analyzeBtn}>
            <Icon source="link-plus" size={16} color="#0f172a" />
            <Text style={styles.analyzeText}>
              {loading ? analyzingLabel : analyzeLabel}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    color: "#0f172a",
  },
  helper: {
    fontSize: 12,
    color: "#64748b",
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
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
  },
  analyzePressable: {
    borderRadius: 14,
  },
  analyzePressed: {
    opacity: 0.9,
  },
  analyzeDisabled: {
    opacity: 0.5,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  analyzeText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default ManualLinkCard;
