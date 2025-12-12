import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useTranslation } from "react-i18next";
import InfoRow from "./InfoRow";
import AdditionalInfoList from "./AdditionalInfoList";
import LocationAssistButton from "./LocationAssistButton";
import DateAssistButton from "./DateAssistButton";
import type { Activity } from "../types";

type Props = {
  activity: Activity;
  locationLabel: string;
  alternateLocations: string[];
  formattedOfficialDates: string[];
  additionalDates: string[];
  needsDate: boolean;
  onOpenLocation: () => void;
  onSuggestDate: () => void;
};

const ActivityOverviewSection: React.FC<Props> = ({
  activity,
  locationLabel,
  alternateLocations,
  formattedOfficialDates,
  additionalDates,
  needsDate,
  onOpenLocation,
  onSuggestDate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text variant="headline" weight="700" style={{ color: colors.text }}>
        {t("activities:details.overview")}
      </Text>
      <View
        style={[styles.sectionUnderline, { backgroundColor: colors.primary }]}
      />

      <InfoRow
        icon="map-marker"
        value={locationLabel ?? t("activities:details.addressMissing")}
        rightSlot={
          <LocationAssistButton
            activity={activity}
            onChangeLocation={() => onOpenLocation()}
          />
        }
      />

      {alternateLocations.length > 0 ? (
        <AdditionalInfoList
          title={t("activities:details.otherLocations")}
          icon="map-marker-outline"
          items={alternateLocations}
        />
      ) : null}

      {(needsDate || formattedOfficialDates.length > 0) && (
        <>
          <InfoRow
            icon="calendar"
            value={
              formattedOfficialDates[0] ?? t("activities:details.dateMissing")
            }
            rightSlot={<DateAssistButton onSuggest={onSuggestDate} />}
          />
          {additionalDates.length > 0 ? (
            <AdditionalInfoList
              title={t("activities:details.otherDates")}
              icon="calendar-range-outline"
              items={additionalDates}
            />
          ) : null}
        </>
      )}
    </View>
  );
};

export default ActivityOverviewSection;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 70,
    borderRadius: 999,
  },
});
