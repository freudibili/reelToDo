import React from "react";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { categoryNeedsDate } from "@features/activities/utils/activityHelper";
import {
  formatActivityLocation,
  formatDisplayDate,
  getOfficialDateValue,
} from "@features/activities/utils/activityDisplay";
import ImportDetailsForm, { type ImportDetailsFormHandle } from "./ImportDetailsForm";
import type { Activity } from "@features/activities/utils/types";
import type { UpdateActivityPayload } from "../types";

type ImportResultCardProps = {
  activity: Activity;
  detailsRef: React.RefObject<ImportDetailsFormHandle>;
  onSave: (payload: UpdateActivityPayload) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  userId?: string | null;
  alreadyHadActivity?: boolean;
};

const ImportResultCard: React.FC<ImportResultCardProps> = ({
  activity,
  detailsRef,
  onSave,
  onCancel,
  onDirtyChange,
  userId,
  alreadyHadActivity = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const officialDate = getOfficialDateValue(activity);
  const titleKey = "import:result.title";
  const subtitleKey = alreadyHadActivity
    ? "import:result.alreadyOwned"
    : "import:result.subtitle";

  return (
    <Card padding="lg" radius="xl" shadow="md" variant="outlined">
      <Stack gap="md">
        <Stack direction="row" align="center" gap="sm">
          <Icon source="check-circle" size={22} color={colors.success} />

          <Stack gap="xxs">
            <Text variant="headline" weight="700">
              {t(titleKey)}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {t(subtitleKey)}
            </Text>
          </Stack>
        </Stack>

        {alreadyHadActivity ? (
          <Stack gap="xxs">
            <Text variant="headline" weight="700">
              {activity.title ?? t("common:labels.activity")}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {formatActivityLocation(activity) ??
                t("import:details.locationFallback")}
            </Text>
            {categoryNeedsDate(activity.category) ? (
              <Text variant="bodySmall" tone="muted">
                {formatDisplayDate(officialDate) ??
                  t("activities:details.dateMissing")}
              </Text>
            ) : null}
          </Stack>
        ) : null}

        <ImportDetailsForm
          ref={detailsRef}
          activity={activity}
          onSave={onSave}
          onCancel={onCancel}
          onDirtyChange={onDirtyChange}
          userId={userId}
        />
      </Stack>
    </Card>
  );
};

export default ImportResultCard;
