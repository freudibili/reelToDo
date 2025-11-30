import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import DateBadge from "./DateBadge";
import { formatCategoryName } from "@features/activities/utils/categorySummary";

interface ActivitySummaryHeaderProps {
  title: string;
  category?: string | null;
  location?: string | null;
  dateLabel?: string | null;
  style?: ViewStyle;
}

const ActivitySummaryHeader: React.FC<ActivitySummaryHeaderProps> = ({
  title,
  category,
  location,
  dateLabel,
  style,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const displayTitle = title || t("labels.activity");
  const metaLine = [
    category ? formatCategoryName(category) : null,
    location,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {displayTitle}
      </Text>
      {metaLine ? (
        <Text style={[styles.meta, { color: colors.secondaryText }]} numberOfLines={2}>
          {metaLine}
        </Text>
      ) : null}
      <DateBadge label={dateLabel} />
    </View>
  );
};

export default ActivitySummaryHeader;

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  meta: {
    fontSize: 14,
  },
});
