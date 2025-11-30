import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useAppTheme } from "@common/theme/appTheme";
import LocationAutocompleteInput from "@features/import/components/LocationAutocompleteInput";

type LocationCardProps = {
  location: string;
  onLocationChange: (value: string) => void;
  tripLength: number;
  onTripLengthChange: (value: number) => void;
};

const quickDurations = [1, 3, 5, 7];

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onLocationChange,
  tripLength,
  onTripLengthChange,
}) => {
  const { colors } = useAppTheme();
  const [locating, setLocating] = React.useState(false);

  const handleAdjustDays = (delta: number) => {
    const next = Math.min(14, Math.max(1, tripLength + delta));
    onTripLengthChange(next);
  };

  const handleQuickDuration = (value: number) => {
    onTripLengthChange(value);
  };

  const handleUseNearby = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        onLocationChange("Near me");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [first] =
        (await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })) ?? [];
      const label = [first?.city ?? first?.subregion, first?.country]
        .filter(Boolean)
        .join(", ");
      onLocationChange(label ? `${label} (nearby)` : "Near me");
    } catch {
      onLocationChange("Near me");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.mutedText }]}>
            Plan a trip
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Where and when?
          </Text>
        </View>
        <Pressable
          onPress={handleUseNearby}
          style={[
            styles.nearbyPill,
            { backgroundColor: colors.accentSurface, borderColor: colors.accentBorder },
            locating && styles.disabled,
          ]}
          disabled={locating}
        >
          <Text style={[styles.nearbyText, { color: colors.accentText }]}>
            {locating ? "Locating..." : "Near me"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.inputBlock}>
        <Text style={[styles.label, { color: colors.mutedText }]}>Location</Text>
        <LocationAutocompleteInput
          initialValue={location}
          onSelectPlace={(place) =>
            onLocationChange(place.formattedAddress ?? place.name ?? location)
          }
          placeholder="Vienna, Florence..."
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={[styles.label, { color: colors.mutedText }]}>
          Length of stay
        </Text>
        <View
          style={[
            styles.counterRow,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <Pressable
            onPress={() => handleAdjustDays(-1)}
            style={[styles.counterBtn, { backgroundColor: colors.surface }]}
            hitSlop={10}
          >
            <Text style={[styles.counterSymbol, { color: colors.text }]}>−</Text>
          </Pressable>
          <Text style={[styles.daysText, { color: colors.text }]}>
            {tripLength} day{tripLength > 1 ? "s" : ""}
          </Text>
          <Pressable
            onPress={() => handleAdjustDays(1)}
            style={[styles.counterBtn, { backgroundColor: colors.surface }]}
            hitSlop={10}
          >
            <Text style={[styles.counterSymbol, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>
        <View style={styles.quickDurations}>
          {quickDurations.map((duration) => {
            const active = duration === tripLength;
            return (
              <Pressable
                key={duration}
                onPress={() => handleQuickDuration(duration)}
                style={[
                  styles.durationPill,
                  {
                    borderColor: active ? colors.accentBorder : colors.border,
                    backgroundColor: active ? colors.accentSurface : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: active ? colors.accentText : colors.text },
                  ]}
                >
                  {duration}d
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default LocationCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  nearbyPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nearbyText: {
    fontSize: 13,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.7,
  },
  inputBlock: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  counterBtn: {
    height: 32,
    width: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  counterSymbol: {
    fontSize: 18,
    fontWeight: "700",
  },
  daysText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },
  quickDurations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
