import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar, Icon } from "react-native-paper";

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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Avatar.Icon
        size={56}
        icon="account-circle"
        style={styles.avatar}
        color="#e2e8f0"
      />
      <View style={styles.info}>
        <Text style={styles.eyebrow}>Profil</Text>
        <Text style={styles.name}>{name}</Text>
        {email ? <Text style={styles.meta}>{email}</Text> : null}
        {address ? <Text style={styles.meta}>{address}</Text> : null}
      </View>
      <Icon source="chevron-right" size={22} color="#cbd5e1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#0b1220",
    marginBottom: 18,
  },
  avatar: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  eyebrow: {
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  meta: {
    marginTop: 2,
    color: "#cbd5e1",
  },
});

export default UserSettingsHeader;
