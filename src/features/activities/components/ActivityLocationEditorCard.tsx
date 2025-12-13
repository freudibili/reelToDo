import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import LocationChangeModal from "@common/components/LocationChangeModal";
import { Badge, Button, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import type { PlaceDetails } from "@features/import/types";

import type { Activity } from "../types";
import AdditionalInfoList from "./AdditionalInfoList";
import InfoRow from "./InfoRow";
import SuggestionPill from "./SuggestionPill";
import {
  formatActivityLocation,
  formatLocationEntry,
  getActivityLocations,
} from "../utils/activityDisplay";
import {
  resolveLocationAction,
  type LocationStatusMeta,
} from "../utils/locationEditor";

type ActivityLocationEditorCardProps = {
  activity: Activity;
  status: LocationStatusMeta;
  draftLocation: PlaceDetails | null;
  onChangeLocation: (payload: {
    place: PlaceDetails;
    note: string | null;
  }) => void;
  onSave: () => void;
  onCancelActivity: () => void;
  saving: boolean;
  deleting: boolean;
  isOwner: boolean;
};

const ActivityLocationEditorCard: React.FC<ActivityLocationEditorCardProps> = ({
  activity,
  status,
  draftLocation,
  onChangeLocation,
  onSave,
  onCancelActivity,
  saving,
  deleting,
  isOwner,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const locations = useMemo(() => getActivityLocations(activity), [activity]);
  const locationLabel = useMemo(() => {
    if (draftLocation) {
      return (
        draftLocation.formattedAddress ||
        draftLocation.name ||
        draftLocation.description
      );
    }
    const formattedPrimary =
      formatLocationEntry(
        locations[0],
        activity.city ?? activity.country ?? null
      ) ?? formatActivityLocation(activity);
    return formattedPrimary ?? t("common:labels.locationPending");
  }, [activity, draftLocation, locations, t]);
  const action = useMemo(
    () => resolveLocationAction({ activity, isOwner, draftLocation }),
    [activity, draftLocation, isOwner]
  );
  const alternateLocations = useMemo(
    () =>
      locations
        .slice(1)
        .map((loc) =>
          formatLocationEntry(loc, activity.city ?? activity.country ?? null)
        )
        .filter((loc): loc is string => Boolean(loc)),
    [activity.city, activity.country, locations]
  );

  const title = status.needsConfirmation
    ? t("activities:details.locationFallback")
    : t("activities:editor.locationConfirmedTitle");

  const statusTone =
    status.tone === "success"
      ? "success"
      : status.tone === "warning"
        ? "danger"
        : "accent";
  const primaryLabel = saving
    ? t("common:locationPicker.submitting")
    : action === "continue"
      ? t("common:buttons.continue")
      : action === "save"
        ? t("activities:editor.saveLocation")
        : t("activities:editor.suggestLocation");

  const handleOpenModal = () => {
    if (saving || deleting) return;
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.sectionHeader,
          { borderBottomColor: colors.primary },
        ]}
      >
        <Text variant="eyebrow" tone="muted">
          {t("activities:details.overview")}
        </Text>
      </View>

      {isOwner ? (
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text variant="title3" style={{ color: colors.text }}>
              {title}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {status.helper}
            </Text>
          </View>
        <Badge tone={statusTone}>{status.label}</Badge>
        </View>
      ) : null}

      <InfoRow
        icon="map-marker"
        value={locationLabel}
        rightSlot={
          <SuggestionPill
            onPress={handleOpenModal}
            label={t("activities:editor.changeLocation")}
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

      <View style={styles.actionsRow}>
        <Button
          label={
            deleting
              ? t("common:buttons.delete") + "…"
              : t("activities:editor.cancelActivity")
          }
          variant="secondary"
          onPress={onCancelActivity}
          disabled={saving || deleting}
          style={{ flex: 1 }}
          shadow={false}
        />
        <Button
          label={primaryLabel}
          variant="primary"
          onPress={onSave}
          disabled={saving || deleting}
          loading={saving}
          style={{ flex: 1 }}
        />
      </View>

      <LocationChangeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectPlace={(payload) => {
          onChangeLocation(payload);
          setModalVisible(false);
        }}
        initialValue={activity.address ?? activity.location_name ?? undefined}
        submitting={saving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 10,
  },
  sectionHeader: {
    alignSelf: "flex-start",
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActivityLocationEditorCard;
