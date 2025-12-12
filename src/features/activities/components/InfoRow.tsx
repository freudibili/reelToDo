import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { Box, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  icon: string;
  value: string;
  rightSlot?: React.ReactNode;
};

const InfoRow: React.FC<Props> = ({ icon, value, rightSlot }) => {
  const { colors } = useAppTheme();

  return (
    <Box
      direction="row"
      align="center"
      gap={12}
      paddingHorizontal="md"
      paddingVertical="sm"
      rounded="md"
      border
      background={colors.card}
      borderColor={colors.border}
      style={styles.infoRow}
    >
      <Box
        height={36}
        width={36}
        rounded="pill"
        align="center"
        justify="center"
        background={colors.accentSurface}
        border
        borderColor={colors.accentBorder}
      >
        <Icon source={icon} size={18} color={colors.accent} />
      </Box>
      <Text variant="body" style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </Box>
  );
};

export default InfoRow;

const styles = StyleSheet.create({
  infoRow: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoValue: {
    flex: 1,
  },
  rightSlot: {
    marginLeft: 8,
  },
});
