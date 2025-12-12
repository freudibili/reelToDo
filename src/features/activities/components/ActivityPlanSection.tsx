import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import DateBadge from "@common/components/DateBadge";
import { Text , IconButton } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import { getDateVisuals } from "../utils/dateVisuals";


type Props = {
  plannedDateLabel: string;
  onEdit: () => void;
  onClear: () => void;
};

const ActivityPlanSection: React.FC<Props> = ({
  plannedDateLabel,
  onEdit,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const visuals = getDateVisuals(colors, "planned");

  return (
    <View style={styles.container}>
      <Text variant="headline" weight="700" style={{ color: colors.text }}>
        {t("activities:planned.title")}
      </Text>
      <View style={styles.planRow}>
        <DateBadge
          label={plannedDateLabel}
          tone="default"
          icon={visuals.icon}
          iconColor={visuals.color}
          iconBackgroundColor={visuals.background}
          labelWeight="normal"
        />
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={38}
            variant="filled"
            tone="primary"
            onPress={onEdit}
            accessibilityLabel={t("activities:planned.ctaEdit")}
          />
          <IconButton
            icon="trash-can-outline"
            size={38}
            variant="subtle"
            tone="danger"
            onPress={onClear}
            accessibilityLabel={t("activities:planned.ctaClear")}
          />
        </View>
      </View>
    </View>
  );
};

export default ActivityPlanSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 8,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
