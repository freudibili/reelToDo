import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ActivityHero from "@common/components/ActivityHero";
import ActivitySummaryHeader from "@common/components/ActivitySummaryHeader";
import ActionRail, { type ActionRailItem } from "@common/components/ActionRail";
import ActionPill from "@common/components/ActionPill";
import {
  formatActivityLocation,
  formatDisplayDate,
} from "../utils/activityDisplay";
import { categoryNeedsDate } from "../utils/activityHelper";
import type { Activity } from "../utils/types";

interface Props {
  activity: Activity | null;
  isFavorite: boolean;
  onDelete: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  onOpenMaps: (activity: Activity) => void;
  onOpenSource: (activity: Activity) => void;
  onAddToCalendar: (activity: Activity) => void;
}

const ActivityDetailsSheet: React.FC<Props> = ({
  activity,
  isFavorite,
  onDelete,
  onToggleFavorite,
  onOpenMaps,
  onOpenSource,
  onAddToCalendar,
}) => {
  if (!activity) return null;

  const dateLabel = formatDisplayDate(activity.main_date);
  const locationLabel =
    formatActivityLocation(activity) ?? "Lieu à confirmer ou préciser";
  const needsDate = categoryNeedsDate(activity.category);

  const actions: ActionRailItem[] = [
    {
      key: "favorite",
      label: isFavorite ? "Retirer favori" : "Favori",
      icon: isFavorite ? "heart" : "heart-outline",
      onPress: () => onToggleFavorite(activity),
    },
    {
      key: "maps",
      label: "Maps",
      icon: "map-marker",
      onPress: () => onOpenMaps(activity),
    },
    ...(needsDate
      ? [
          {
            key: "calendar",
            label: "Calendrier",
            icon: "calendar",
            onPress: () => onAddToCalendar(activity),
          } as ActionRailItem,
        ]
      : []),
    {
      key: "source",
      label: "Source",
      icon: "link-variant",
      onPress: () => onOpenSource(activity),
      disabled: !activity.source_url,
    },
    {
      key: "delete",
      label: "Supprimer",
      icon: "delete-outline",
      tone: "danger" as const,
      onPress: () => onDelete(activity),
    },
  ];

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled
    >
      <ActivitySummaryHeader
        title={activity.title ?? "Activité"}
        category={activity.category}
        location={locationLabel}
        dateLabel={dateLabel}
        style={styles.headerBlock}
      />

      <View style={styles.actionsRailWrapper}>
        <ActionRail actions={actions} />
      </View>

      <ActivityHero
        title={activity.title ?? "Activité"}
        category={activity.category}
        location={locationLabel}
        dateLabel={dateLabel}
        imageUrl={activity.image_url}
        showOverlayContent={false}
      />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Overview</Text>
        <View style={styles.sectionUnderline} />
      </View>
      <InfoRow
        icon="map-marker"
        value={activity.address ?? "Adresse non précisée"}
      />
      {needsDate ? (
        <InfoRow icon="calendar" value={dateLabel ?? "Date non précisée"} />
      ) : null}
    </BottomSheetScrollView>
  );
};

const InfoRow: React.FC<{ icon: string; value: string }> = ({
  icon,
  value,
}) => (
  <View style={styles.infoRow}>
    <ActionPill
      icon={icon}
      label=""
      onPress={() => {}}
      style={styles.infoIcon}
      textStyle={styles.hiddenText}
    />
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default ActivityDetailsSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 18,
    gap: 10,
  },
  headerBlock: {
    paddingHorizontal: 4,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 2,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 70,
    backgroundColor: "#0f172a",
    borderRadius: 999,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  infoIcon: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 32,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  infoValue: {
    fontSize: 14,
    color: "#0f172a",
    flex: 1,
  },
  hiddenText: { display: "none" },
  subtle: {
    fontSize: 12,
    color: "#475569",
  },
  muted: {
    fontSize: 12,
    color: "#94a3b8",
  },
  link: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  actionsRailWrapper: {
    marginTop: 6,
  },
});
