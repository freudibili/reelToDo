import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "@common/components/AppScreen";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import { useActivityDetails } from "@features/activities/hooks/useActivityDetails";
import ProcessingStateCard from "@features/import/components/ProcessingStateCard";

const ActivityScreen = () => {
  const { id } = useLocalSearchParams();
  const activityId = useMemo(
    () => (Array.isArray(id) ? id[0] : id) ?? null,
    [id]
  );
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { activity, loading } = useActivityDetails(activityId);
  const processingStatus = activity?.processing_status ?? "complete";
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";

  const displayNeedsDate = activity
    ? categoryNeedsDate(activity.category)
    : false;
  const locationLabel =
    activity && formatActivityLocation(activity)
      ? formatActivityLocation(activity)
      : activity
        ? t("import:details.locationFallback")
        : null;
  const dateLabel =
    activity && displayNeedsDate
      ? formatDisplayDate(getOfficialDateValue(activity)) ??
        t("activities:details.dateMissing")
      : null;

  const headerTitle = activity?.title ?? t("common:labels.activity");

  return (
    <Screen
      headerTitle={headerTitle}
      onBackPress={() => router.back()}
      loading={loading && !activity}
      scrollable
    >
      {!activity && loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : null}

      {!activity && !loading ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.text }}>
            {t("activities:errors.notFound")}
          </Text>
        </View>
      ) : null}

      {activity ? (
        <View style={styles.content}>
          {isProcessing ? (
            <ProcessingStateCard mode="processing" />
          ) : null}

          {isFailed ? (
            <ProcessingStateCard
              mode="failed"
              message={activity.processing_error}
            />
          ) : null}

          <ActivityHero
            title={activity.title ?? t("common:labels.activity")}
            category={activity.category}
            location={locationLabel ?? t("import:details.locationFallback")}
            dateLabel={dateLabel ?? undefined}
            imageUrl={activity.image_url}
            showOverlayContent={false}
          />

          <ActivitySummaryHeader
            title={activity.title ?? t("common:labels.activity")}
            category={activity.category}
            location={locationLabel ?? t("import:details.locationFallback")}
            dateLabel={dateLabel ?? undefined}
          />

          <View style={styles.metaBlock}>
            <Text style={[styles.metaLabel, { color: colors.secondaryText }]}>
              {t("activities:details.locationFallback")}
            </Text>
            <Text style={{ color: colors.text }}>
              {locationLabel ?? t("import:details.locationFallback")}
            </Text>
            {dateLabel ? (
              <Text style={{ color: colors.text }}>{dateLabel}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  metaBlock: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 13,
  },
});

export default ActivityScreen;
