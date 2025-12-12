import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";

import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  title: string;
  icon: string;
  items: string[];
};

const AdditionalInfoList: React.FC<Props> = ({ title, icon, items }) => {
  const { colors } = useAppTheme();
  if (!items || items.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <Text style={[styles.title, { color: colors.secondaryText }]}>
        {title}
      </Text>
      <View style={styles.items}>
        {items.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={styles.itemRow}
          >
            <Icon source={icon} size={18} color={colors.secondaryText} />
            <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={2}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AdditionalInfoList;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  items: {
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
});
