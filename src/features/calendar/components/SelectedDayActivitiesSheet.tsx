import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Activity } from "@features/activities/types";

import DayActivitiesList from "./DayActivitiesList";
import type { CalendarActivityEntry } from "../types";

interface Props {
  dateLabel: string;
  subtitle: string | null;
  entries: CalendarActivityEntry[];
  favoriteIds: string[];
  emptyLabel: string;
  onSelectActivity: (activity: Activity) => void;
  tabBarHeight: number;
}

const SelectedDayActivitiesSheet: React.FC<Props> = ({
  dateLabel,
  subtitle,
  entries,
  favoriteIds,
  emptyLabel,
  onSelectActivity,
  tabBarHeight,
}) => {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 8) + tabBarHeight + 16;

  return (
    <BottomSheetScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      <DayActivitiesList
        dateLabel={dateLabel}
        subtitle={subtitle}
        entries={entries}
        favoriteIds={favoriteIds}
        emptyLabel={emptyLabel}
        onSelectActivity={onSelectActivity}
      />
    </BottomSheetScrollView>
  );
};

export default SelectedDayActivitiesSheet;
