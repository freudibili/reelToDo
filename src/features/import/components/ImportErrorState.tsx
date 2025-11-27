import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

interface ImportErrorStateProps {
  message?: string | null;
  onGoHome: () => void;
}

const ImportErrorState: React.FC<ImportErrorStateProps> = ({
  message,
  onGoHome,
}) => {
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.overlay }]}>
        <Icon source="emoticon-happy-outline" size={30} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t("import:errorState.title")}
      </Text>
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        {t("import:errorState.description")}
      </Text>

      {message ? (
        <View
          style={[
            styles.messageBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.messageLabel, { color: colors.text }]}>
            {t("import:errorState.reasonLabel")}
          </Text>
          <Text style={[styles.messageText, { color: colors.secondaryText }]}>
            {message}
          </Text>
        </View>
      ) : null}

      <Pressable
        style={[
          styles.homeBtn,
          { backgroundColor: colors.primary },
        ]}
        onPress={onGoHome}
      >
        <Icon
          source="home-variant-outline"
          size={18}
          color={mode === "dark" ? colors.background : "#fff"}
        />
        <Text
          style={[
            styles.homeBtnText,
            { color: mode === "dark" ? colors.background : "#fff" },
          ]}
        >
          {t("import:errorState.homeCta")}
        </Text>
      </Pressable>
    </View>
  );
};

export default ImportErrorState;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
  messageBox: {
    width: "100%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 14,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
