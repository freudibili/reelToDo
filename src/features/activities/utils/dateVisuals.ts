import type { AppTheme } from "@common/theme/appTheme";

export type DateVisualKind = "planned" | "official";

export const getDateVisuals = (
  colors: AppTheme["colors"],
  kind: DateVisualKind
) => {
  if (kind === "planned") {
    return {
      icon: "calendar-check",
      color: colors.plannedDate,
      background: colors.plannedDateBackground,
    };
  }

  return {
    icon: "calendar-blank",
    color: colors.officialDate,
    background: colors.officialDateBackground,
  };
};
