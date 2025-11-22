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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Avatar.Icon size={56} icon="account-circle" style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {email ? <Text style={styles.meta}>{email}</Text> : null}
        {address ? <Text style={styles.meta}>{address}</Text> : null}
      </View>
      <Icon source="chevron-right" size={22} color="#9ca3af" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#f1f5f9",
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  meta: {
    marginTop: 2,
    color: "#6b7280",
  },
});

export default UserSettingsHeader;
