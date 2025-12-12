import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton, Text } from "@common/designSystem";
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
  const { t } = useTranslation();
  const hasHeader = !!title || !!subtitle;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, shadowColor: colors.text },
          cardStyle,
        ]}
      >
        <IconButton
          icon="close"
          size={32}
          variant="subtle"
          tone="default"
          accessibilityLabel={t("accessibility.close")}
          onPress={onClose}
          style={styles.closeBtn}
          shadow={false}
        />

        {hasHeader && (
          <View style={styles.header}>
            {title ? (
              <Text variant="title3" weight="700">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="body" tone="muted">
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
  },
  header: {
    gap: 6,
    paddingRight: 36, // keep space from close button
  },
  content: {
    marginTop: 0,
  },
  contentWithHeader: {
    marginTop: 12,
  },
});
