import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

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
  const { colors, mode } = useAppTheme();

  return (
    <View style={styles.actionsRow}>
      <Pressable style={styles.cancelBtn} onPress={onCancel}>
        <Text style={[styles.cancelBtnText, { color: colors.secondaryText }]}>
          {t("import:details.cancel")}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary },
          disabled && styles.saveBtnDisabled,
          disabled && { backgroundColor: colors.border },
        ]}
        disabled={disabled}
        onPress={onSave}
      >
        <Text
          style={[
            styles.saveBtnText,
            { color: mode === "dark" ? colors.background : "#fff" },
          ]}
        >
          {t("common:buttons.save")}
        </Text>
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
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveBtnDisabled: {
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
