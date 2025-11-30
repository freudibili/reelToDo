import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
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
      <View style={styles.empty}>
        <Text style={{ color: colors.text }}>{t("activities:list.emptyTitle")}</Text>
        <Text style={{ color: colors.secondaryText }}>
          {t("activities:list.emptySubtitle")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.gridWrapper}>
        {data.map((section) => (
          <View key={section.id} style={styles.cardColumn}>
            <CategoryCard
              id={section.id}
              name={section.name}
              activityCount={section.activityCount}
              heroImageUrl={section.heroImageUrl}
              hasCluster={section.hasCluster}
              onPress={onSelectCategory}
            />
          </View>
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
    marginBottom: 16,
  },
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
