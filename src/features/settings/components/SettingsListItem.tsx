import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Icon } from "react-native-paper";

import { Box, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type Tone = "default" | "danger";

interface Props {
  title: string;
  description?: string;
  icon?: string;
  onPress?: (event: GestureResponderEvent) => void;
  right?: React.ReactNode;
  tone?: Tone;
}

const SettingsListItem: React.FC<Props> = ({
  title,
  description,
  icon = "chevron-right",
  onPress,
  right,
  tone = "default",
}) => {
  const { colors } = useAppTheme();
  const titleStyle = tone === "danger" ? { color: colors.danger } : undefined;
  const iconColor = tone === "danger" ? colors.danger : colors.primary;
  const iconBg = tone === "danger" ? "rgba(248,113,113,0.12)" : colors.overlay;

  const content = (
    <Stack direction="row" align="center" gap="md" style={styles.item}>
      <Box rounded="md" background={iconBg} center style={styles.iconPill}>
        <Icon source={icon} size={20} color={iconColor} />
      </Box>

      <Box style={styles.textBlock} gap={4}>
        <Text variant="headline" style={titleStyle}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySmall" tone="muted" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </Box>

      <View style={styles.right}>
        {right}
        {onPress ? (
          <Icon source="chevron-right" size={20} color={colors.secondaryText} />
        ) : null}
      </View>
    </Stack>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed ? { backgroundColor: colors.overlay } : undefined,
      ]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 8,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SettingsListItem;
