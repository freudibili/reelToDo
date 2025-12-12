import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface AppBottomSheetProps {
  index: number;
  snapPoints?: (string | number)[];
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
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const bottomSpacing = Math.max(insets.bottom, 8);
    const resolvedSnapPoints = snapPoints ?? ["25%", "60%", "90%"];

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
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        onClose={onClose}
        enableOverDrag
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.border },
        ]}
        backgroundStyle={[
          styles.sheetBackground,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
            borderTopColor: colors.border,
          },
        ]}
        handleStyle={styles.handle}
      >
        <BottomSheetView
          style={[styles.content, { backgroundColor: colors.surface }, style]}
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -6 },
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  handle: {
    backgroundColor: "transparent",
  },
  handleIndicator: {},
  content: {
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
    right: 12,
    top: 12,
    zIndex: 10,
  },
});
