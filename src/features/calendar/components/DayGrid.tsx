import type { FC } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box, Text, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { getDateVisuals } from "@features/activities/utils/dateVisuals";

import { CalendarDay } from "../utils/dates";

interface Props {
  days: CalendarDay[];
  selectedDate: string;
  todayKey: string;
  locale: string;
  onSelectDay: (dayKey: string) => void;
}

// With flexBasis/maxWidth: "18%" ~ 5 columns per row
const COLUMNS = 5;

const DayGrid: FC<Props> = ({
  days,
  selectedDate,
  todayKey,
  locale,
  onSelectDay,
}) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;

  // Safe area height = screen - top/bottom insets
  const safeAreaHeight = screenHeight - (insets.top + insets.bottom);
  const maxGridHeight = safeAreaHeight * 0.75;

  // compute once, not inside map
  const plannedVisuals = getDateVisuals(colors, "planned");
  const officialVisuals = getDateVisuals(colors, "official");
  const plannedDotColor = plannedVisuals.color;
  const officialDotColor = officialVisuals.color;

  // --- spacer logic to keep last row left-aligned with space-between ---
  const remainder = days.length % COLUMNS;
  const spacerCount = remainder === 0 ? 0 : COLUMNS - remainder;
  const daysWithSpacers: (CalendarDay | null)[] = [
    ...days,
    ...Array(spacerCount).fill(null),
  ];
  // ---------------------------------------------------------------------

  return (
    <ScrollView
      style={{ maxHeight: maxGridHeight }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.daysGrid}>
        {daysWithSpacers.map((item, index) => {
          // Render invisible spacers to fill the last row
          if (!item) {
            return (
              <View
                key={`spacer-${index}`}
                style={[styles.dayChip, styles.spacer]}
                pointerEvents="none"
              />
            );
          }

          const isToday = item.key === todayKey;
          const isSelected = item.key === selectedDate;
          const dotBorder = isSelected ? colors.surface : colors.border;
          const dayBackground = isSelected
            ? colors.primary
            : isToday
              ? colors.overlay
              : colors.surface;
          const dayBorder = isSelected || isToday ? colors.primary : colors.border;
          const dayNumberColor = isSelected
            ? colors.background
            : isToday
              ? colors.primary
              : colors.text;
          const dayLabelColor = isSelected
            ? colors.background
            : isToday
              ? colors.primary
              : colors.secondaryText;

          return (
            <Pressable
              key={item.key}
              style={styles.dayChip}
              onPress={() => onSelectDay(item.key)}
              hitSlop={6}
            >
              <Box
                border
                rounded="md"
                align="center"
                paddingVertical="xs"
                paddingHorizontal="xs"
                background={dayBackground}
                borderColor={dayBorder}
                style={styles.chipContent}
              >
                <Text
                  variant="title3"
                  style={[styles.dayNumber, { color: dayNumberColor }]}
                >
                  {item.date.getDate()}
                </Text>
                <Text
                  variant="caption"
                  uppercase
                  weight="700"
                  style={{ color: dayLabelColor }}
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
              </Box>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default DayGrid;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.sm,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayChip: {
    flexBasis: "18%",
    maxWidth: "18%",
  },
  chipContent: {
    width: "100%",
  },
  dayNumber: {
    marginTop: 1,
    transform: [{ translateY: -2 }],
  },
  dayDotRow: {
    marginTop: spacing.xs,
    height: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs - 3,
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
  spacer: {
    opacity: 0,
  },
});
