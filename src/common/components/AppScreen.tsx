import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ScreenHeader, { type ScreenHeaderProps } from "./ScreenHeader";

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  backgroundColor?: string;
  withBottomInset?: boolean;
  loading?: boolean;
  scrollable?: boolean;
  footer?: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerEyebrow?: string;
  headerRight?: React.ReactNode;
  onBackPress?: () => void;
  headerCompact?: boolean;
  headerComponent?: React.ReactNode;
  keyboardOffset?: number;
  alignToTabBar?: boolean;
  flushBottom?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  style,
  noPadding = false,
  backgroundColor = "#fff",
  withBottomInset = true,
  loading = false,
  scrollable = false,
  footer,
  headerTitle,
  headerSubtitle,
  headerEyebrow,
  headerRight,
  onBackPress,
  headerCompact = false,
  headerComponent,
  keyboardOffset,
  alignToTabBar = true,
  flushBottom = false,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;

  const hasTabBar = tabBarHeight > 0;
  const bottomBase = alignToTabBar
    ? hasTabBar
      ? 0
      : insets.bottom
    : insets.bottom;
  const bottomGutter = withBottomInset ? bottomBase : 0;
  const horizontalPadding = noPadding ? 0 : 12;
  const verticalPadding = noPadding ? 0 : 4;
  const contentBottomPadding = flushBottom
    ? bottomGutter
    : (noPadding ? 0 : 20) + bottomGutter + (footer ? 12 : 0);
  const footerPaddingBottom = bottomGutter + (noPadding ? 8 : 12);

  const keyboardVerticalOffset = keyboardOffset ?? insets.top;

  const renderHeader =
    headerComponent ||
    (headerTitle ? (
      <ScreenHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        eyebrow={headerEyebrow}
        onBackPress={onBackPress}
        right={headerRight}
        compact={headerCompact}
      />
    ) : null);

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: verticalPadding,
          paddingHorizontal: horizontalPadding,
          paddingBottom: contentBottomPadding,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      showsVerticalScrollIndicator={false}
    >
      {renderHeader}
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.inner,
        {
          paddingTop: verticalPadding,
          paddingHorizontal: horizontalPadding,
          paddingBottom: contentBottomPadding,
        },
      ]}
    >
      {renderHeader}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={[styles.container, style]}>
          <View style={styles.contentArea}>{content}</View>

          {footer ? (
            <View
              style={[
                styles.footer,
                {
                  paddingHorizontal: horizontalPadding,
                  paddingBottom: footerPaddingBottom,
                },
              ]}
            >
              {footer}
            </View>
          ) : null}

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1 },
  footer: {
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

export { ScreenHeader };
export type { ScreenHeaderProps };
export default AppScreen;
