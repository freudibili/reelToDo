import type { EdgeInsets } from "react-native-safe-area-context";

import { spacing } from "@common/designSystem";

import {
  CALENDAR_GRID_COLUMNS,
  CALENDAR_MAX_MONTH_DAYS,
} from "../constants";

interface GridLayoutInput {
  dayCount: number;
  screenHeight: number;
  insets: EdgeInsets;
  columns?: number;
  maxDayCount?: number;
}

export const calculateDayGridLayout = ({
  dayCount,
  columns = CALENDAR_GRID_COLUMNS,
  screenHeight,
  insets,
  maxDayCount = CALENDAR_MAX_MONTH_DAYS,
}: GridLayoutInput) => {
  const safeAreaHeight = screenHeight - (insets.top + insets.bottom);
  const maxGridHeight = safeAreaHeight * 0.75;
  const rowCount = Math.max(1, Math.ceil(maxDayCount / columns));
  const shouldCondenseRows = rowCount > 6 || dayCount >= maxDayCount;
  const chipPadding = shouldCondenseRows ? spacing.xxs : spacing.xs;
  const rowGap = shouldCondenseRows ? spacing.xs : spacing.sm;
  const availableHeight = Math.max(
    0,
    maxGridHeight - rowGap * Math.max(0, rowCount - 1)
  );
  const chipHeight = availableHeight / rowCount;

  return {
    shouldCondenseRows,
    chipPadding,
    rowGap,
    rowCount,
    maxGridHeight,
    chipHeight,
  };
};
