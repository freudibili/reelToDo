import React from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppBottomSheetProps {
  index: number;
  snapPoints: (string | number)[];
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
}

const AppBottomSheet = React.forwardRef<BottomSheet, AppBottomSheetProps>(
  (
    {
      index,
      snapPoints,
      onClose,
      children,
      style,
      contentStyle,
      scrollable = false,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const bottomSpacing = Math.max(insets.bottom, 8);

    const content = scrollable ? (
      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.inner,
          contentStyle,
          { paddingBottom: bottomSpacing + 16 },
        ]}
        nestedScrollEnabled
      >
        {children}
      </BottomSheetScrollView>
    ) : (
      <View
        style={[
          styles.inner,
          contentStyle,
          { paddingBottom: bottomSpacing + 12 },
        ]}
      >
        {children}
      </View>
    );

    return (
      <BottomSheet
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        enableOverDrag
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handle}
      >
        <BottomSheetView style={[styles.content, style]}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <View style={styles.body}>{content}</View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AppBottomSheet.displayName = "AppBottomSheet";

export default AppBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 }, // 👈 shadow on top
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 15, // 👈 Android shadow (always below, but helps soften edges)
      },
    }),
  },
  handle: {
    backgroundColor: "transparent",
  },
  handleIndicator: {
    backgroundColor: "#e2e8f0",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
    overflow: "hidden",
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: "#f1f3f4",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    fontSize: 18,
    lineHeight: 20,
    color: "#000",
    includeFontPadding: false,
  },
});
