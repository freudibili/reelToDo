import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

interface ImportFooterProps {
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const ImportFooter: React.FC<ImportFooterProps> = ({
  disabled,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.actionsRow}>
      <Pressable style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>{t("import:details.cancel")}</Text>
      </Pressable>

      <Pressable
        style={[styles.saveBtn, disabled && styles.saveBtnDisabled]}
        disabled={disabled}
        onPress={onSave}
      >
        <Text style={styles.saveBtnText}>{t("common:buttons.save")}</Text>
      </Pressable>
    </View>
  );
};

export default ImportFooter;

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#64748b",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#0f172a",
  },
  saveBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
