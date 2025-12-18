import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import Screen from "@common/components/AppScreen";
import { useAppTheme } from "@common/theme/appTheme";
import DateChangeModal from "@features/activities/components/DateChangeModal";
import ProcessingStateCard from "@features/import/components/ProcessingStateCard";

import ActivityDateEditorCard from "../components/ActivityDateEditorCard";
import ActivityLocationEditorCard from "../components/ActivityLocationEditorCard";
import ActivityScreenFooter from "../components/ActivityScreenFooter";
import { useActivityScreenController } from "../hooks/useActivityScreenController";
import { shouldShowActivityFooter } from "../utils/activityScreen";

const ActivityScreen = () => {
  const { id, created, from } = useLocalSearchParams();
  const activityId = useMemo(
    () => (Array.isArray(id) ? id[0] : id) ?? null,
    [id]
  );
  const sourceParam = useMemo(
    () => (Array.isArray(from) ? from[0] : from) ?? null,
    [from]
  );
  const shouldShowFooter = useMemo(() => {
    if (sourceParam === "notification") return true;
    return shouldShowActivityFooter(created);
  }, [created, sourceParam]);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const shouldExitToActivities = sourceParam === "notification";

  const exitScreen = useCallback(() => {
    if (shouldExitToActivities) {
      router.replace("/activities" as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/activities" as never);
  }, [router, shouldExitToActivities]);

  const controller = useActivityScreenController({
    activityId,
    onExit: exitScreen,
    onDeleted: () => router.replace("/activities" as never),
  });

  const {
    activity,
    loading,
    headerTitle,
    isProcessing,
    isFailed,
    locationLabel,
    dateLabel,
    locationStatus,
    dateStatus,
    draftLocation,
    draftDate,
    handleLocationSelected,
    handleDateSelected,
    savingLocation,
    savingDate,
    deletingActivity,
    isOwner,
    footerProps,
    openDateModal,
    closeDateModal,
    dateModalVisible,
    dateModalMode,
    dateModalTitle,
    dateModalSubtitle,
    dateModalInitialValue,
    handleDateModalSubmit,
  } = controller;

  return (
    <Screen
      headerTitle={headerTitle}
      onBackPress={exitScreen}
      loading={loading && !activity}
      scrollable
      footer={shouldShowFooter ? <ActivityScreenFooter {...footerProps} /> : null}
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
          {isProcessing ? <ProcessingStateCard mode="processing" /> : null}

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

          {locationStatus ? (
            <ActivityLocationEditorCard
              activity={activity}
              status={locationStatus}
              draftLocation={draftLocation}
              onChangeLocation={handleLocationSelected}
              saving={savingLocation}
              isOwner={isOwner}
              disabled={deletingActivity}
            />
          ) : null}

          {dateStatus ? (
            <ActivityDateEditorCard
              activity={activity}
              status={dateStatus}
              draftDate={draftDate}
              onChangeDate={handleDateSelected}
              onRequestChange={!isOwner ? openDateModal : undefined}
              isOwner={isOwner}
            />
          ) : null}
        </View>
      ) : null}

      <DateChangeModal
        visible={dateModalVisible}
        onClose={closeDateModal}
        onSubmit={handleDateModalSubmit}
        submitting={savingDate}
        initialValue={dateModalInitialValue}
        title={dateModalTitle}
        subtitle={dateModalSubtitle}
        mode={dateModalMode}
      />
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
});

export default ActivityScreen;
