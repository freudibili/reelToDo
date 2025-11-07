import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
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

const ActivityList: React.FC<Props> = ({ data, onSelect }) => {
  const { width } = useWindowDimensions();
  const columns = getColumns(width);

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
          <View style={styles.grid}>
            {section.activities.map((activity) => (
              <View
                key={activity.id}
                style={[styles.cardWrapper, { width: `${100 / columns}%` }]}
              >
                <ActivityCard activity={activity} onPress={onSelect} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const getColumns = (width: number) => {
  if (Platform.OS === "web") {
    if (width >= 1200) return 4;
    if (width >= 900) return 3;
    return 2;
  }
  if (width >= 600) return 3;
  return 2;
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  cardWrapper: {
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
