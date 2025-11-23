import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface ImportErrorStateProps {
  message?: string | null;
  onGoHome: () => void;
}

const ImportErrorState: React.FC<ImportErrorStateProps> = ({
  message,
  onGoHome,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Icon source="emoticon-happy-outline" size={30} color="#0f172a" />
      </View>

      <Text style={styles.title}>{t("import:errorState.title")}</Text>
      <Text style={styles.description}>
        {t("import:errorState.description")}
      </Text>

      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>
            {t("import:errorState.reasonLabel")}
          </Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <Pressable style={styles.homeBtn} onPress={onGoHome}>
        <Icon source="home-variant-outline" size={18} color="#fff" />
        <Text style={styles.homeBtnText}>
          {t("import:errorState.homeCta")}
        </Text>
      </Pressable>
    </View>
  );
};

export default ImportErrorState;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  messageBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 14,
    color: "#0f172a",
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0f172a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  homeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
