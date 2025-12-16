import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, View } from "react-native";
import { Icon } from "react-native-paper";

import { Box, GradientButton, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import CategoryCard from "./CategoryCard";
import type { CategoryCardItem } from "../store/activitiesSelectors";

interface Props {
  data: CategoryCardItem[];
  onSelectCategory: (category: string) => void;
  onImport: () => void;
}

const ActivityList: React.FC<Props> = ({
  data,
  onSelectCategory,
  onImport,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const noActivities = !data || data.length === 0;

  if (noActivities) {
    return (
      <View style={styles.emptyContainer}>
        <Stack
          align="center"
          justify="center"
          gap="lg"
          style={styles.emptyContent}
        >
          <Stack align="center" gap="xs" style={styles.emptyCopy}>
            <Text variant="headline" align="center">
              {t("activities:list.emptyTitle")}
            </Text>
            <Text variant="bodySmall" tone="muted" align="center">
              {t("activities:list.emptySubtitle")}
            </Text>
          </Stack>
          <GradientButton
            label={t("activities:list.emptyCta")}
            icon={<Icon source="link-plus" size={18} color={colors.favoriteContrast} />}
            onPress={onImport}
          />
        </Stack>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.gridWrapper}>
        {data.map((section) => (
          <Box key={section.id} style={styles.cardColumn}>
            <CategoryCard
              id={section.id}
              name={section.name}
              activityCount={section.activityCount}
              heroImageUrl={section.heroImageUrl}
              hasCluster={section.hasCluster}
              onPress={onSelectCategory}
            />
          </Box>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    paddingBottom: 20,
  },
  cardColumn: {
    width: "50%",
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyCopy: {
    maxWidth: 320,
  },
});

export default ActivityList;
