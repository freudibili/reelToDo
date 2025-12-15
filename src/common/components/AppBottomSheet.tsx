import BottomSheet from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ViewStyle, Platform, View } from "react-native";

import { IconButton } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

interface AppBottomSheetProps {
  index: number;
  snapPoints?: (string | number)[];
  onClose: () => void;
  children: React.ReactNode;
  handleContainerStyle?: ViewStyle;
}

const AppBottomSheet = React.forwardRef<BottomSheet, AppBottomSheetProps>(
  (
    {
      index,
      snapPoints,
      onClose,
      children,
      handleContainerStyle,
    },
    ref
  ) => {
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? ["25%", "60%", "90%"],
      [snapPoints]
    );

    return (
      <BottomSheet
        ref={ref}
        index={index}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        onClose={onClose}
        enableOverDrag
        handleStyle={[styles.handle, handleContainerStyle]}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.border },
        ]}
        backgroundStyle={[
          styles.sheetBackground,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
            shadowOpacity: Platform.OS === "ios" ? 0.16 : undefined,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View pointerEvents="box-none" style={styles.overlay}>
          <View
            style={[
              styles.closeWrapper,
              { backgroundColor: colors.overlaySurface },
            ]}
          >
            <IconButton
              icon="close"
              size={30}
              variant="ghost"
              tone="default"
              accessibilityLabel={t("accessibility.close")}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              shadow={false}
            />
          </View>
        </View>
        {children}
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
    borderTopWidth: 1,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  closeWrapper: {
    position: "absolute",
    right: 12,
    top: 8,
    borderRadius: 999,
    padding: 2,
    zIndex: 10,
  },
  closeBtn: {
    alignSelf: "center",
  },
});
