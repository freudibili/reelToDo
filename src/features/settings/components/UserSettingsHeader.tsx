import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

interface Props {
  name: string;
  email?: string;
  address?: string;
  onPress?: () => void;
}

const UserSettingsHeader: React.FC<Props> = ({
  name,
  email,
  address,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Avatar.Icon
        size={56}
        icon="account-circle"
        style={[styles.avatar, { backgroundColor: colors.overlay }]}
        color={colors.secondaryText}
      />
      <View style={styles.info}>
        <Text style={[styles.eyebrow, { color: colors.secondaryText }]}>
          {t("settings:items.profile")}
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        {email ? (
          <Text style={[styles.meta, { color: colors.mutedText }]}>{email}</Text>
        ) : null}
        {address ? (
          <Text style={[styles.meta, { color: colors.mutedText }]}>
            {address}
          </Text>
        ) : null}
      </View>
      <Icon source="chevron-right" size={22} color={colors.secondaryText} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
  },
  avatar: {},
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    marginTop: 2,
  },
});

export default UserSettingsHeader;
