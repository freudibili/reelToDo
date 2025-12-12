import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";
import type { Activity } from "../utils/types";
import type { PlaceDetails } from "@features/import/services/locationService";
import LocationChangeModal from "@common/components/LocationChangeModal";
import { formatActivityLocation } from "../utils/activityDisplay";
import type { LocationStatusMeta } from "../utils/locationEditor";
import InfoRow from "./InfoRow";
import SuggestionPill from "./SuggestionPill";

type ActivityLocationEditorCardProps = {
  activity: Activity;
  status: LocationStatusMeta;
  draftLocation: PlaceDetails | null;
  onChangeLocation: (place: PlaceDetails) => void;
  onSave: () => void;
  onCancelActivity: () => void;
  saving: boolean;
  deleting: boolean;
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
}) => {
  const { colors, mode } = useAppTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const locationLabel = useMemo(() => {
    if (draftLocation) {
      return draftLocation.formattedAddress || draftLocation.name || draftLocation.description;
    }
    return formatActivityLocation(activity) ?? t("common:labels.locationPending");
  }, [activity, draftLocation, t]);

  const title = status.needsConfirmation
    ? t("activities:details.locationFallback")
    : t("activities:editor.locationConfirmedTitle");

  const statusColor =
    status.tone === "success"
      ? colors.success
      : status.tone === "warning"
        ? colors.danger
        : colors.accent;

  const handleOpenModal = () => {
    if (saving || deleting) return;
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: colors.secondaryText }]}>
          {t("activities:details.overview")}
        </Text>
        <View
          style={[styles.sectionUnderline, { backgroundColor: colors.primary }]}
        />
      </View>

      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {status.helper}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>

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

      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.danger,
              backgroundColor: colors.overlay,
            },
          ]}
          onPress={onCancelActivity}
          disabled={saving || deleting}
        >
          <Text style={[styles.secondaryText, { color: colors.danger }]}>
            {deleting ? t("common:buttons.delete") + "…" : t("activities:editor.cancelActivity")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor: saving ? colors.overlay : colors.primary,
              borderColor: colors.primaryBorder,
            },
          ]}
          onPress={onSave}
          disabled={saving || deleting}
        >
          <Text
            style={[
              styles.primaryText,
              {
                color: saving
                  ? colors.secondaryText
                  : mode === "dark"
                    ? colors.text
                    : colors.surface,
              },
            ]}
          >
            {saving ? t("common:locationPicker.submitting") : t("activities:editor.saveLocation")}
          </Text>
        </Pressable>
      </View>

      <LocationChangeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectPlace={(payload) => {
          onChangeLocation(payload.place);
          setModalVisible(false);
        }}
        initialValue={activity.address ?? activity.location_name ?? undefined}
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
    marginBottom: 2,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 48,
    borderRadius: 999,
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
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.2,
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
  primaryText: {
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ActivityLocationEditorCard;
