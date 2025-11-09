import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  ViewStyle,
  Linking,
  Platform,
} from "react-native";
import {
  deleteActivity,
  addFavorite,
  removeFavorite,
} from "../store/activitiesSlice";
import { activitiesSelectors } from "../store/activitiesSelectors";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { Activity } from "../utils/types";
import { useConfirmDialog } from "@common/hooks/useConfirmDialog";

interface Props {
  visible: boolean;
  activity: Activity | null;
  onClose: () => void;
}

const ActivityDetailsModal: React.FC<Props> = ({
  visible,
  activity,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmDialog();
  const favoriteIds = useAppSelector(activitiesSelectors.favoriteIds);
  const [internalVisible, setInternalVisible] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  const isFavorite =
    !!activity && favoriteIds ? favoriteIds.includes(activity.id) : false;

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

  if (!activity) return null;

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
        dispatch(deleteActivity(activity.id));
        handleRequestClose();
      },
      { cancelText: "Annuler", confirmText: "Supprimer" }
    );
  };

  const handleToggleFavorite = () => {
    if (!activity) return;
    if (isFavorite) {
      dispatch(removeFavorite(activity.id));
    } else {
      dispatch(addFavorite(activity.id));
    }
  };

  const handleOpenMaps = () => {
    if (activity.latitude && activity.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
      Linking.openURL(url);
      return;
    }
    const query =
      activity.address ||
      activity.location_name ||
      activity.city ||
      activity.title;
    if (query) {
      const encoded = encodeURIComponent(query);
      const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
      Linking.openURL(url);
    }
  };

  const handleOpenSource = () => {
    if (activity.source_url) {
      Linking.openURL(activity.source_url);
    }
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const animatedStyle = {
    opacity: anim,
    transform: [{ translateY }] as NonNullable<ViewStyle["transform"]>,
  };

  const metaLocation =
    activity.city ||
    activity.location_name ||
    activity.address ||
    activity.country ||
    "—";

  return (
    <Modal
      animationType="fade"
      transparent
      visible={internalVisible}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.screen, animatedStyle]}>
          <View style={styles.headerImageWrapper}>
            {activity.image_url ? (
              <ImageBackground
                source={{ uri: activity.image_url }}
                style={styles.headerImage}
              >
                <View style={styles.headerOverlay} />
              </ImageBackground>
            ) : (
              <View style={styles.headerPlaceholder}>
                <Text style={styles.headerPlaceholderText}>
                  {activity.title?.slice(0, 1).toUpperCase() ?? "A"}
                </Text>
              </View>
            )}

            <View style={styles.topBar}>
              <Pressable
                style={styles.topBarBtn}
                onPress={handleToggleFavorite}
              >
                <Text style={styles.topBarIcon}>{isFavorite ? "♥" : "♡"}</Text>
              </Pressable>
              <Pressable style={styles.topBarBtn} onPress={handleRequestClose}>
                <Text style={styles.topBarIcon}>×</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contentCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.title}>{activity.title ?? "Activité"}</Text>
              <Text style={styles.meta}>
                {activity.category ?? "—"} · {metaLocation}
              </Text>
              {activity.creator ? (
                <Text style={styles.creator}>par {activity.creator}</Text>
              ) : null}

              <View style={styles.block}>
                <Text style={styles.label}>Lieu</Text>
                <Text style={styles.value}>
                  {activity.location_name ?? "—"}
                </Text>
                {activity.address ? (
                  <Text style={styles.value}>{activity.address}</Text>
                ) : null}
                {activity.city ? (
                  <Text style={styles.value}>{activity.city}</Text>
                ) : null}
                {activity.country ? (
                  <Text style={styles.value}>{activity.country}</Text>
                ) : null}
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
                <Text style={styles.label}>Confiance</Text>
                <Text style={styles.value}>
                  {activity.confidence
                    ? `${Math.round(activity.confidence * 100)}%`
                    : "—"}
                </Text>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.footerBtn} onPress={handleOpenMaps}>
              <Text style={styles.footerBtnText}>Ouvrir Maps</Text>
            </Pressable>
            <Pressable
              style={[
                styles.footerBtn,
                !activity.source_url && styles.disabled,
              ]}
              onPress={handleOpenSource}
              disabled={!activity.source_url}
            >
              <Text style={styles.footerBtnText}>Voir la source</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>🗑</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  headerImageWrapper: {
    height: 240,
    width: "100%",
  },
  headerImage: {
    height: "100%",
    width: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  headerPlaceholder: {
    height: "100%",
    width: "100%",
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  headerPlaceholderText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  topBarBtn: {
    backgroundColor: "rgba(0,0,0,0.35)",
    height: 34,
    width: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarIcon: {
    color: "#fff",
    fontSize: 18,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -40,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  meta: {
    marginTop: 4,
    color: "#64748b",
  },
  creator: {
    marginTop: 4,
    color: "#0f172a",
  },
  block: {
    marginTop: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#0f172a",
  },
  value: {
    color: "#1f2937",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 16 : 10,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  deleteBtn: {
    width: 44,
    borderRadius: 999,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default ActivityDetailsModal;
