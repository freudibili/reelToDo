import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import ImportDetailsForm, {
  type ImportDetailsFormHandle,
} from "./ImportDetailsForm";
import type { Activity } from "@features/activities/utils/types";
import type { UpdateActivityPayload } from "../utils/types";
import { useTranslation } from "react-i18next";

interface ImportResultCardProps {
  activity: Activity;
  detailsRef: React.RefObject<ImportDetailsFormHandle>;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

const ImportResultCard: React.FC<ImportResultCardProps> = ({
  activity,
  detailsRef,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.resultHeader}>
        <View style={styles.badge}>
          <Icon source="check-circle" size={22} color="#0f172a" />
        </View>
        <View>
          <Text style={styles.title}>
            {t("import:result.title", "Analysis ready")}
          </Text>
          <Text style={styles.subtitle}>
            {t(
              "import:result.subtitle",
              "Review the details we found and tweak if needed."
            )}
          </Text>
        </View>
      </View>

      <ImportDetailsForm
        ref={detailsRef}
        activity={activity}
        onSave={onSave}
        onCancel={onCancel}
        onDirtyChange={onDirtyChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
  },
});

export default ImportResultCard;
