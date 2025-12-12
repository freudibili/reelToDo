import type { TFunction } from "i18next";

export const getPlanActionLabel = (
  plannedDateLabel: string | null | undefined,
  t: TFunction
) =>
  plannedDateLabel
    ? t("activities:planned.ctaEdit")
    : t("activities:planned.ctaAdd");
