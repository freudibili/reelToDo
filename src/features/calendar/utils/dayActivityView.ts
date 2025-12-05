import type { TFunction } from "i18next";
import type { AppTheme } from "@common/theme/appTheme";
import type { Activity } from "@features/activities/utils/types";
import {
  formatActivityLocation,
  formatDisplayDateTime,
  formatDisplayTime,
  getOfficialDateValue,
  hasTimeComponent,
  isSameDateValue,
} from "@features/activities/utils/activityDisplay";
import { getDateVisuals } from "@features/activities/utils/dateVisuals";
import type { CalendarActivityEntry } from "../types";

export type DayActivityViewModel = {
  id: string;
  activity: Activity;
  title: string;
  mainLabel: string;
  officialLabel?: string | null;
  plannedLabel?: string | null;
  locationLabel?: string | null;
  iconName: string;
  isFavorite: boolean;
  timelineColor: string;
  timelineBorderColor: string;
  cardBorderColor: string;
  shadowColor: string;
};

export const buildDayActivityViews = (
  entries: CalendarActivityEntry[],
  favoriteIds: string[],
  t: TFunction,
  colors: AppTheme["colors"]
): DayActivityViewModel[] => {
  return entries.map((entry) => {
    const { activity, dateValue, source } = entry;
    const timeLabel =
      formatDisplayTime(dateValue) ?? t("activities:calendar.allDay");
    const locationLabel = formatActivityLocation(activity);
    const isPlanned = source === "planned";
    const officialDateValue = getOfficialDateValue(activity);
    const plannedValue = activity.planned_at ?? null;

    const officialLabel =
      isPlanned &&
      officialDateValue &&
      !isSameDateValue(officialDateValue, dateValue)
        ? formatDisplayDateTime(officialDateValue)
        : null;

    const plannedLabel =
      !isPlanned &&
      plannedValue &&
      !isSameDateValue(plannedValue, dateValue)
        ? t("activities:planned.timeLabel", {
            value:
              formatDisplayDateTime(plannedValue) ??
              formatDisplayTime(plannedValue) ??
              t("activities:calendar.allDay"),
          })
        : null;

    const visuals = getDateVisuals(colors, isPlanned ? "planned" : "official");
    const iconName = visuals.icon;
    const isFavorite = favoriteIds.includes(activity.id);
    const timelineColor = visuals.color;
    const timelineBorderColor = isPlanned
      ? colors.surface
      : colors.accentBorder;
    const cardBorderColor = isPlanned ? colors.border : colors.accentBorder;
    const shadowColor = isPlanned ? colors.primary : colors.accent;

    const title = activity.title || t("activities:card.untitled");

    const mainLabel = isPlanned
      ? t("activities:planned.timeLabel", {
          value: timeLabel,
        })
      : t("activities:planned.officialLabel", {
          value: formatDisplayDateTime(dateValue) ?? timeLabel,
        });

    return {
      id: activity.id,
      activity,
      title,
      mainLabel,
      officialLabel,
      plannedLabel,
      locationLabel,
      iconName,
      isFavorite,
      timelineColor,
      timelineBorderColor,
      cardBorderColor,
      shadowColor,
    };
  });
};
