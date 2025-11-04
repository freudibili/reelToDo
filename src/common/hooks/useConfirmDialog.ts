import { Alert, Platform } from "react-native";

export const useConfirmDialog = () => {
  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { cancelText?: string; confirmText?: string }
  ) => {
    const cancelText = options?.cancelText ?? "Annuler";
    const confirmText = options?.confirmText ?? "Confirmer";

    if (Platform.OS === "web") {
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok) onConfirm();
      return;
    }

    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel" },
        { text: confirmText, style: "destructive", onPress: onConfirm },
      ],
      { cancelable: true }
    );
  };

  return { confirm };
};
