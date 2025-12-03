import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

import ImportDetailsForm, {
  type ImportDetailsFormHandle,
} from "./ImportDetailsForm";
import type { Activity } from "@features/activities/utils/types";
import type { UpdateActivityPayload } from "../utils/types";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

interface ImportResultCardProps {
  activity: Activity;
  detailsRef: React.RefObject<ImportDetailsFormHandle>;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  userId?: string | null;
  alreadyHadActivity?: boolean;
}

const ImportResultCard: React.FC<ImportResultCardProps> = ({
  activity,
  detailsRef,
  onSave,
  onCancel,
  onDirtyChange,
  userId,
  alreadyHadActivity = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const officialDate = getOfficialDateValue(activity);
  const titleKey = "import:result.title";
  const subtitleKey = alreadyHadActivity
    ? "import:result.alreadyOwned"
    : "import:result.subtitle";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.resultHeader}>
        <View style={styles.badge}>
          <Icon source="check-circle" size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t(titleKey, "Analysis ready")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {t(subtitleKey, "Review the details we found and tweak if needed.")}
          </Text>
        </View>
      </View>

      {alreadyHadActivity ? (
        <View style={styles.summary}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {activity.title ?? t("common:labels.activity")}
          </Text>
          <Text style={[styles.summaryMeta, { color: colors.secondaryText }]}>
            {formatActivityLocation(activity) ??
              t("import:details.locationFallback")}
          </Text>
          {categoryNeedsDate(activity.category) && (
            <Text style={[styles.summaryMeta, { color: colors.secondaryText }]}>
              {formatDisplayDate(officialDate) ??
                t("activities:details.dateMissing")}
            </Text>
          )}
        </View>
      ) : null}

      <ImportDetailsForm
        ref={detailsRef}
        activity={activity}
        onSave={onSave}
        onCancel={onCancel}
        onDirtyChange={onDirtyChange}
        userId={userId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
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
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  summary: {
    marginTop: 8,
    gap: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryMeta: {
    fontSize: 13,
  },
});

export default ImportResultCard;
