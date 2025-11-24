import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDay } from "../utils/dates";

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
  return (
    <View style={styles.daysGrid}>
      {days.map((item) => {
        const isToday = item.key === todayKey;
        const isSelected = item.key === selectedDate;
        return (
          <Pressable
            key={item.key}
            style={[
              styles.dayChip,
              isSelected && styles.dayChipSelected,
              isToday && styles.dayChipToday,
            ]}
            onPress={() => onSelectDay(item.key)}
            hitSlop={6}
          >
            <Text
              style={[
                styles.dayNumber,
                (isSelected || isToday) && styles.dayChipTextToday,
              ]}
            >
              {item.date.getDate()}
            </Text>
            <Text
              style={[
                styles.dayChipText,
                (isSelected || isToday) && styles.dayChipTextToday,
              ]}
            >
              {item.date.toLocaleDateString(locale, { weekday: "short" })}
            </Text>
            <View style={styles.dayDotRow}>
              <View
                style={[
                  styles.dayDot,
                  (item.hasActivity || isSelected) && styles.dayDotActive,
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
    justifyContent: "space-between",
    columnGap: 4,
    rowGap: 10,
    marginBottom: 10,
  },
  dayChip: {
    flexBasis: "13.5%",
    maxWidth: "13.5%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayChipSelected: {
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  dayChipToday: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  dayChipText: {
    color: "#475569",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dayChipTextToday: {
    color: "#fff",
    fontWeight: "800",
  },
  dayNumber: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  dayDotRow: {
    marginTop: 4,
    height: 8,
    justifyContent: "center",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  dayDotActive: {
    backgroundColor: "#0ea5e9",
  },
});
