import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

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
  const displayTitle = title || t("labels.activity");
  const metaLine = [category, location].filter(Boolean).join(" • ");

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title} numberOfLines={2}>
        {displayTitle}
      </Text>
      {metaLine ? (
        <Text style={styles.meta} numberOfLines={2}>
          {metaLine}
        </Text>
      ) : null}
      {dateLabel ? <Text style={styles.metaMuted}>{dateLabel}</Text> : null}
    </View>
  );
};

export default ActivitySummaryHeader;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 24,
  },
  meta: {
    fontSize: 14,
    color: "#475569",
  },
  metaMuted: {
    fontSize: 13,
    color: "#94a3b8",
  },
});
