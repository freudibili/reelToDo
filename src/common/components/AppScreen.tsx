import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ScreenHeader, { type ScreenHeaderProps } from "./ScreenHeader";

interface AppScreenProps {
  children: React.ReactNode;
  noPadding?: boolean;
  backgroundColor?: string;
  withBottomInset?: boolean;
  loading?: boolean;
  scrollable?: boolean;
  footer?: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerRight?: React.ReactNode;
  onBackPress?: () => void;
  headerCompact?: boolean;
  alignToTabBar?: boolean;
  flushBottom?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  noPadding = false,
  backgroundColor = "#fff",
  withBottomInset = true,
  loading = false,
  scrollable = false,
  footer,
  headerTitle,
  headerSubtitle,
  headerRight,
  onBackPress,
  headerCompact = false,
  alignToTabBar = true,
  flushBottom = false,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;
  const [footerHeight, setFooterHeight] = React.useState(0);
  const bottomInsetRef = React.useRef(insets.bottom);

  React.useEffect(() => {
    if (insets.bottom > bottomInsetRef.current) {
      bottomInsetRef.current = insets.bottom;
    }
  }, [insets.bottom]);

  const hasTabBar = tabBarHeight > 0;
  const footerOffset = alignToTabBar && hasTabBar ? tabBarHeight : 0;
  const footerBottomPadding =
    withBottomInset && !hasTabBar ? bottomInsetRef.current : 0;
  const horizontalPadding = noPadding ? 0 : 12;
  const verticalPadding = noPadding ? 0 : 4;
  const baseBottomSpacing = flushBottom ? 0 : noPadding ? 0 : 20;
  const contentBottomPadding =
    baseBottomSpacing +
    (footer
      ? footerHeight + footerOffset + footerBottomPadding
      : footerBottomPadding);

  const handleFooterLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      setFooterHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const renderHeader =
    headerTitle || onBackPress ? (
      <ScreenHeader
        title={headerTitle ?? ""}
        subtitle={headerSubtitle}
        onBackPress={onBackPress}
        right={headerRight}
        compact={headerCompact}
        alignLeftWhenNoBack={!onBackPress}
      />
    ) : null;

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
    <View style={[styles.inner]}>
      <View
        style={{
          paddingTop: verticalPadding,
          paddingHorizontal: horizontalPadding,
          paddingBottom: contentBottomPadding,
          flex: 1,
        }}
      >
        {renderHeader}
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.top}
        >
          <View style={styles.contentArea}>{content}</View>
        </KeyboardAvoidingView>

        {footer ? (
          <View
            onLayout={handleFooterLayout}
            style={[
              styles.footer,
              {
                paddingHorizontal: horizontalPadding,
                paddingTop: noPadding ? 8 : 12,
                paddingBottom: footerBottomPadding,
                backgroundColor,
                position: "absolute",
                left: 0,
                right: 0,
                bottom: footerOffset,
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
    borderTopWidth: StyleSheet.hairlineWidth,
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
