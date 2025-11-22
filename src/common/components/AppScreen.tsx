import React from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  Text,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { IconButton } from "react-native-paper";

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  backgroundColor?: string;
  withBottomInset?: boolean;
  loading?: boolean;
  scrollable?: boolean;
  footer?: React.ReactNode;
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBackPress?: () => void;
  right?: React.ReactNode;
  compact?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  onBackPress,
  right,
  compact = false,
}) => {
  const titleStyle = compact ? styles.headerTitleCompact : styles.headerTitle;
  const wrapperStyle = compact ? styles.headerCompact : styles.header;
  return (
    <View style={wrapperStyle}>
      {onBackPress ? (
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={onBackPress}
          style={styles.backButton}
        />
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.headerText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={titleStyle}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              compact && styles.headerSubtitleCompact,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
};

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  style,
  noPadding = false,
  backgroundColor = "#fff",
  withBottomInset = false,
  loading = false,
  scrollable = false,
  footer,
}) => {
  const insets = useSafeAreaInsets();
  const paddingStyle = noPadding ? null : styles.contentPadding;

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[paddingStyle, styles.scrollContent]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, paddingStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top,
          marginBottom: withBottomInset ? 0 : -insets.bottom,
        },
        noPadding && { paddingHorizontal: 0 },
        style,
      ]}
    >
      <View style={styles.contentArea}>{content}</View>

      {footer ? <View style={[styles.footer]}>{footer}</View> : null}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  contentPadding: { paddingHorizontal: 12, paddingBottom: 20 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 4 },
  inner: { flex: 1, paddingTop: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  backButton: {
    marginLeft: -8,
    marginRight: 4,
  },
  backPlaceholder: {
    width: 40,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: "#9aa0ad",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "none",
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#1a1a1a" },
  headerTitleCompact: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  headerSubtitle: { marginTop: 2, color: "#8a8f98" },
  headerSubtitleCompact: { fontSize: 12.5, color: "#8a8f98" },
  headerRight: { minWidth: 40, alignItems: "flex-end" },
  footer: {
    paddingHorizontal: 12,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
});

export default AppScreen;
