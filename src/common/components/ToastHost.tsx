import React from "react";
import { Text, StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { hideToast, selectToast } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";
import { useRouter } from "expo-router";

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
              labelStyle: [styles.action, { color: colors.surface }],
            }
          : undefined
      }
    >
      <Text style={[styles.text, { color: colors.surface }]}>{toast.message ?? ""}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  text: {
    fontWeight: "700",
  },
  action: {
    fontWeight: "800",
  },
});

export default ToastHost;
