import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  ViewStyle,
} from "react-native";
import { Modal, IconButton } from "react-native-paper";
import type { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";

interface Props {
  visible: boolean;
  activity: Activity | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const ActivityDetailsModal: React.FC<Props> = ({
  visible,
  activity,
  onClose,
  onDelete,
}) => {
  const { confirm } = useConfirmDialog();
  const [internalVisible, setInternalVisible] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setInternalVisible(false);
          onClose();
        }
      });
    }
  }, [visible, anim, onClose]);

  if (!activity || !internalVisible) return null;

  const handleRequestClose = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setInternalVisible(false);
        onClose();
      }
    });
  };

  const handleDelete = () => {
    confirm(
      "Supprimer cette activité ?",
      "Cette action est définitive.",
      () => {
        onDelete(activity.id);
        handleRequestClose();
      },
      { cancelText: "Annuler", confirmText: "Supprimer" }
    );
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const animatedStyle = {
    opacity: anim,
    transform: [{ translateY }, { scale }] as NonNullable<
      ViewStyle["transform"]
    >,
  };

  return (
    <Modal
      visible={internalVisible}
      onDismiss={handleRequestClose}
      dismissable
      style={styles.modalBackground}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <IconButton icon="close" size={22} onPress={handleRequestClose} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activity.image_url ? (
            <Image source={{ uri: activity.image_url }} style={styles.image} />
          ) : null}

          <Text style={styles.title}>{activity.title ?? "Activity"}</Text>
          <Text style={styles.meta}>
            {activity.category ?? "—"} ·{" "}
            {activity.city ?? activity.location_name ?? "—"}
          </Text>
          {activity.creator ? (
            <Text style={styles.creator}>by {activity.creator}</Text>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{activity.location_name ?? "—"}</Text>
            <Text style={styles.value}>{activity.address ?? ""}</Text>
            <Text style={styles.value}>{activity.city ?? ""}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.value}>{activity.source_url ?? "—"}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.label}>Tags</Text>
            <Text style={styles.value}>
              {Array.isArray(activity.tags) && activity.tags.length
                ? activity.tags.join(", ")
                : "—"}
            </Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>
              {activity.confidence
                ? `${Math.round(activity.confidence * 100)}%`
                : "—"}
            </Text>
          </View>
        </ScrollView>

        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Supprimer</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  title: { fontSize: 20, fontWeight: "700" },
  meta: { marginTop: 4, color: "#555" },
  creator: { marginTop: 4, color: "#333" },
  block: { marginTop: 14 },
  label: { fontWeight: "600", marginBottom: 4 },
  value: { color: "#333" },
  deleteBtn: {
    marginTop: 16,
    backgroundColor: "#d32f2f",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "600" },
});

export default ActivityDetailsModal;
