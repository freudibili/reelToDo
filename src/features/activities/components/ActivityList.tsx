import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Box, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import CategoryCard from "./CategoryCard";
import type { CategoryCardItem } from "../store/activitiesSelectors";

interface Props {
  data: CategoryCardItem[];
  onSelectCategory: (category: string) => void;
}

const ActivityList: React.FC<Props> = ({ data, onSelectCategory }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!data || data.length === 0) {
    return (
      <Stack align="center" gap="xs" style={styles.empty}>
        <Text variant="headline">{t("activities:list.emptyTitle")}</Text>
        <Text variant="bodySmall" tone="muted">
          {t("activities:list.emptySubtitle")}
        </Text>
      </Stack>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
