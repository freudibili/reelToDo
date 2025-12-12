import { useTranslation } from "react-i18next";
import { Alert, Platform } from "react-native";

export const useConfirmDialog = () => {
  const { t } = useTranslation();

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { cancelText?: string; confirmText?: string }
  ) => {
    const cancelText = options?.cancelText ?? t("buttons.cancel");
    const confirmText = options?.confirmText ?? t("buttons.confirm");

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
