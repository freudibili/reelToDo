import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDay } from "../utils/dates";
import { useAppTheme } from "@common/theme/appTheme";
import { getDateVisuals } from "@features/activities/utils/dateVisuals";

interface Props {
  days: CalendarDay[];
  selectedDate: string;
  todayKey: string;
  locale: string;
  onSelectDay: (dayKey: string) => void;
}

const DayGrid: React.FC<Props> = ({
  days,
  selectedDate,
  todayKey,
  locale,
  onSelectDay,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.daysGrid}>
      {days.map((item) => {
        const isToday = item.key === todayKey;
        const isSelected = item.key === selectedDate;
        const plannedVisuals = getDateVisuals(colors, "planned");
        const officialVisuals = getDateVisuals(colors, "official");
        const plannedDotColor = plannedVisuals.color;
        const officialDotColor = officialVisuals.color;
        const dotBorder = isSelected ? colors.surface : colors.border;
        return (
          <Pressable
            key={item.key}
            style={[
              styles.dayChip,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isSelected && {
                borderColor: colors.primary,
                backgroundColor: colors.primary,
              },
              isToday && {
                borderColor: colors.primary,
                backgroundColor: colors.overlay,
              },
            ]}
            onPress={() => onSelectDay(item.key)}
            hitSlop={6}
          >
            <Text
              style={[
                styles.dayNumber,
                { color: colors.text },
                isSelected && { color: colors.background },
                isToday && { color: colors.primary, fontWeight: "800" },
              ]}
            >
              {item.date.getDate()}
            </Text>
            <Text
              style={[
                styles.dayChipText,
                { color: colors.secondaryText },
                isSelected && { color: colors.background, fontWeight: "800" },
                isToday && { color: colors.primary, fontWeight: "800" },
              ]}
            >
              {item.date.toLocaleDateString(locale, { weekday: "short" })}
            </Text>
            <View style={styles.dayDotRow}>
              <View
                style={[
                  styles.dayDot,
                  { backgroundColor: colors.border, borderColor: dotBorder },
                  item.hasPlanned && {
                    backgroundColor: plannedDotColor,
                  },
                ]}
              />
              <View
                style={[
                  styles.dayDot,
                  styles.secondaryDot,
                  { backgroundColor: colors.border, borderColor: dotBorder },
                  item.hasOfficial && {
                    backgroundColor: officialDotColor,
                  },
                ]}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default DayGrid;

const styles = StyleSheet.create({
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 6,
    rowGap: 10,
    marginBottom: 10,
  },
  dayChip: {
    flexBasis: "18%",
    maxWidth: "18%",
    borderRadius: 12,
    paddingVertical: 5,
    alignItems: "center",
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayNumber: {
    marginTop: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  dayDotRow: {
    marginTop: 4,
    height: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  secondaryDot: {
    marginTop: 0,
  },
});
