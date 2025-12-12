import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";

import { Text } from "@common/designSystem";
import { hideToast, selectToast } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppSelector, useAppDispatch } from "@core/store/hook";

const ToastHost = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);
  const { colors } = useAppTheme();
  const router = useRouter();

  const background = (() => {
    if (toast.message === null) return colors.surface;
    if (toast.type === "error") return colors.danger;
    if (toast.type === "success") return colors.success;
    return colors.accent;
  })();

  const handleAction = () => {
    if (toast.action?.href) {
      router.push(toast.action.href as never);
    }
    dispatch(hideToast());
  };

  return (
    <Snackbar
      visible={!!toast.message}
      onDismiss={() => dispatch(hideToast())}
      duration={3500}
      style={[styles.snackbar, { backgroundColor: background }]}
      action={
        toast.action
          ? {
              label: toast.action.label,
              onPress: handleAction,
              labelStyle: [styles.action, { color: colors.favoriteContrast }],
            }
          : undefined
      }
    >
      <Text variant="bodyStrong" weight="700" tone="inverse">
        {toast.message ?? ""}
      </Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  action: {
    fontWeight: "800",
  },
});

export default ToastHost;
