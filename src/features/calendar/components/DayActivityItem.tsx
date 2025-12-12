import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { Box, Stack, Text, spacing } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import type { DayActivityViewModel } from "../utils/dayActivityView";

type Props = {
  item: DayActivityViewModel;
  isLast: boolean;
  onSelect: (item: DayActivityViewModel) => void;
};

const DayActivityItem: React.FC<Props> = ({ item, isLast, onSelect }) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
      accessibilityRole="button"
    >
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: item.timelineColor,
              borderColor: item.timelineBorderColor,
            },
          ]}
        />
        {!isLast ? (
          <View
            style={[
              styles.timelineLine,
              { backgroundColor: item.timelineColor },
            ]}
          />
        ) : null}
      </View>

      <Box
        flex={1}
        rounded="md"
        border
        padding="md"
        background={colors.surface}
        borderColor={item.cardBorderColor}
        shadow
        style={[styles.cardBody, { shadowColor: item.shadowColor }]}
      >
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          gap="xs"
          style={styles.titleRow}
        >
          <Text variant="headline" numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
          {item.isFavorite ? (
            <Icon source="heart" size={16} color={colors.favorite} />
          ) : null}
        </Stack>

        <Stack direction="row" align="center" gap="xs" style={styles.metaRow}>
          <Icon source={item.iconName} size={14} color={item.timelineColor} />
          <Text variant="bodySmall" tone="subtle" style={styles.flexText}>
            {item.mainLabel}
          </Text>
        </Stack>

        {item.officialLabel ? (
          <Text variant="bodySmall" tone="subtle" style={styles.spacedText}>
            {item.officialLabel}
          </Text>
        ) : null}

        {item.plannedLabel ? (
          <Text variant="bodySmall" tone="subtle" style={styles.spacedText}>
            {item.plannedLabel}
          </Text>
        ) : null}

        {item.locationLabel ? (
          <Stack direction="row" align="center" gap="xs" style={styles.metaRow}>
            <Icon
              source="map-marker-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              variant="bodySmall"
              tone="subtle"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.flexText}
            >
              {item.locationLabel}
            </Text>
          </Stack>
        ) : null}
      </Box>
    </Pressable>
  );
};

export default DayActivityItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rowPressed: {
    opacity: 0.94,
  },
  timelineColumn: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  cardBody: {
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  titleRow: {
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  flexText: {
    flex: 1,
  },
  spacedText: {
    marginTop: 4,
  },
});
