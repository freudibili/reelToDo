import React from "react";
import ActionRail, { type ActionRailItem } from "@common/components/ActionRail";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import type { Activity } from "../types";
import { getPlanActionLabel } from "../utils/actionHelpers";

type Props = {
  activity: Activity;
  isFavorite: boolean;
  onDelete: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  onOpenMaps: (activity: Activity) => void;
  onOpenSource: (activity: Activity) => void;
  onAddToCalendar: (activity: Activity) => void;
  openPicker: () => void;
};

const ActivityDetailsActions: React.FC<Props> = ({
  activity,
  isFavorite,
  onDelete,
  onToggleFavorite,
  onOpenMaps,
  onOpenSource,
  onAddToCalendar,
  openPicker,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const planActionLabel = getPlanActionLabel(activity.planned_at, t);

  const actions: ActionRailItem[] = [
    {
      key: "plan",
      label: planActionLabel,
      icon: activity.planned_at ? "calendar-edit" : "calendar-plus",
      onPress: openPicker,
    },
    {
      key: "maps",
      label: t("activities:details.actions.maps"),
      icon: "map-marker",
      onPress: () => onOpenMaps(activity),
    },
    {
      key: "favorite",
      label: t("activities:details.actions.favorite"),
      icon: isFavorite ? "heart" : "heart-outline",
      iconColor: isFavorite ? colors.favorite : undefined,
      onPress: () => onToggleFavorite(activity),
    },
    {
      key: "source",
      label: t("activities:details.actions.source"),
      icon: "link-variant",
      onPress: () => onOpenSource(activity),
      disabled: !activity.source_url,
    },
    {
      key: "delete",
      label: t("activities:details.actions.delete"),
      icon: "delete-outline",
      tone: "danger" as const,
      onPress: () => onDelete(activity),
    },
  ];

  return <ActionRail actions={actions} />;
};

export default ActivityDetailsActions;
