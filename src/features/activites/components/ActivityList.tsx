import React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import ActivityCard from "./ActivityCard";
import type { Activity } from "../utils/types";

interface Props {
  data: Activity[];
  onSelect: (activity: Activity) => void;
}

const ActivityList: React.FC<Props> = ({ data, onSelect }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ActivityCard activity={item} onPress={onSelect} />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>No activities yet.</Text>
          <Text>Import one from the Import screen.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  empty: { marginTop: 40, alignItems: "center", gap: 4 },
});

export default ActivityList;
