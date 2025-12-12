import React from "react";
import { Text, StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";
import { useAppSelector, useAppDispatch } from "@core/store/hook";
import { hideToast, selectToast } from "@common/store/appSlice";
import { useAppTheme } from "@common/theme/appTheme";

const ToastHost = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);
  const { colors } = useAppTheme();

  const background = (() => {
    if (toast.message === null) return colors.surface;
    if (toast.type === "error") return colors.danger;
    if (toast.type === "success") return colors.success;
    return colors.primary;
  })();

  return (
    <Snackbar
      visible={!!toast.message}
      onDismiss={() => dispatch(hideToast())}
      duration={3500}
      style={[styles.snackbar, { backgroundColor: background }]}
    >
      <Text style={styles.text}>{toast.message ?? ""}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default ToastHost;
