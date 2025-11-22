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

interface CategoryGroup {
  category: string;
  activities: Activity[];
}

interface Props {
  data: CategoryGroup[];
  onSelect: (activity: Activity) => void;
}

const ActivityList: React.FC<Props> = ({
  data,
  onSelect,
}) => {
  const { width } = useWindowDimensions();

  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No activities yet.</Text>
        <Text>Import one from the Import screen.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {data.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.category}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {section.activities.slice(0, 8).map((activity) => (
              <View
                key={activity.id}
                style={[styles.cardWrapper, { width: Math.min(width * 0.62, 250) }]}
              >
                <ActivityCard
                  activity={activity}
                  onPress={onSelect}
                />
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
                <Pressable style={styles.moreWrapper}>
                  <Text style={styles.moreLabel}>+{section.activities.length - 8}</Text>
                  <Text style={styles.moreTitle}>Voir plus</Text>
                  <Text style={styles.moreHint}>Toutes les activités</Text>
                  <Text style={styles.moreLink}>Ouvrir</Text>
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
    paddingBottom: 40,
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
    backgroundColor: "#0f0f0f",
    justifyContent: "space-between",
  },
  moreLabel: { color: "#888", fontSize: 14, marginBottom: 2 },
  moreTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  moreHint: { color: "#aaa", fontSize: 14, marginTop: 6 },
  moreLink: {
    marginTop: 10,
    color: "#4da6ff",
    fontWeight: "600",
  },
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
