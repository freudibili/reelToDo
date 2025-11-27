import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import ActivityCard from "./ActivityCard";
import type { Activity } from "../utils/types";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

interface CategoryGroup {
  category: string;
  activities: Activity[];
}

interface Props {
  data: CategoryGroup[];
  onSelect: (activity: Activity) => void;
}

const ActivityList: React.FC<Props> = ({ data, onSelect }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { colors, mode } = useAppTheme();

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
      {data.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.category}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {section.activities.slice(0, 8).map((activity) => (
              <View
                key={activity.id}
                style={[
                  styles.cardWrapper,
                  { width: Math.min(width * 0.62, 250) },
                ]}
              >
                <ActivityCard activity={activity} onPress={onSelect} />
              </View>
            ))}
            {section.activities.length > 8 ? (
              <Link
                href={{
                  pathname: "/activities/[category]",
                  params: { category: section.category },
                }}
                asChild
              >
                <Pressable
                  style={[
                    styles.moreWrapper,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.moreLabel, { color: colors.secondaryText }]}
                  >
                    +{section.activities.length - 8}
                  </Text>
                  <Text style={[styles.moreTitle, { color: colors.text }]}>
                    {t("activities:list.more.title")}
                  </Text>
                  <Text
                    style={[styles.moreHint, { color: colors.secondaryText }]}
                  >
                    {t("activities:list.more.hint")}
                  </Text>
                  <Text
                    style={[
                      styles.moreLink,
                      { color: mode === "dark" ? colors.primary : "#4da6ff" },
                    ]}
                  >
                    {t("activities:list.more.open")}
                  </Text>
                </Pressable>
              </Link>
            ) : null}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardWrapper: {
    marginRight: 12,
  },
  horizontalList: { paddingHorizontal: 4 },
  moreWrapper: {
    width: 180,
    marginRight: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  moreLabel: { color: "#888", fontSize: 14, marginBottom: 2 },
  moreTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  moreHint: { color: "#aaa", fontSize: 14, marginTop: 6 },
  moreLink: {
    marginTop: 10,
    fontWeight: "600",
  },
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
