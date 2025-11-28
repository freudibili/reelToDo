import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Pressable,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@common/theme/appTheme";

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  cardStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  cardStyle,
  contentStyle,
}) => {
  const { colors } = useAppTheme();
  const hasHeader = !!title || !!subtitle;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, shadowColor: colors.text },
          cardStyle,
        ]}
      >
        <Pressable
          style={[styles.closeBtn, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        >
          <Text style={[styles.closeText, { color: colors.text }]}>×</Text>
        </Pressable>

        {hasHeader && (
          <View style={styles.header}>
            {title ? (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}

        <View
          style={[
            styles.content,
            hasHeader && styles.contentWithHeader,
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "20%",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
  header: {
    gap: 6,
    paddingRight: 36, // keep space from close button
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  content: {
    marginTop: 0,
  },
  contentWithHeader: {
    marginTop: 12,
  },
});
