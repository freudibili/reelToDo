import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type Props = {
  source?: string | null;
  style?: StyleProp<ViewStyle>;
};

const sourceIconMap: Record<string, string> = {
  instagram: "instagram",
  facebook: "facebook",
  tiktok: "music-note",
  youtube: "youtube",
  app: "pencil",
  generic: "link-variant",
};

const ActivitySourceBadge: React.FC<Props> = ({
  source,
  style,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!source) return null;

  const sourceKey = source ?? "generic";
  const sourceLabel = t(`activities:details.sources.${sourceKey}`, {
    defaultValue: t("activities:details.sources.generic"),
  });
  const sourceIcon = sourceIconMap[sourceKey] ?? sourceIconMap.generic;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: colors.accentSurface,
            borderColor: colors.accentBorder,
          },
        ]}
      >
        <Icon source={sourceIcon} size={16} color={colors.accent} />
      </View>
      <Text variant="body" style={styles.label} numberOfLines={1}>
        {sourceLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrapper: {
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
  },
});

export default ActivitySourceBadge;
