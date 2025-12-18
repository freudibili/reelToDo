import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { Text } from "@common/designSystem";
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
      <Text variant="eyebrow" tone="muted">
        {title}
      </Text>
      <View style={styles.items}>
        {items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.itemRow}>
            <Icon source={icon} size={18} color={colors.secondaryText} />
            <Text
              variant="body"
              style={{ color: colors.text }}
              numberOfLines={2}
            >
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
  items: {
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    gap: 8,
  },
});
