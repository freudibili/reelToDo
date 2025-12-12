import { Alert, Linking } from "react-native";

export const SUPPORT_EMAIL = "hello@reeltodo.com";

export const buildSupportMailTo = (subject: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export const openSupportMail = async ({
  subject,
  errorTitle,
  errorMessage,
}: {
  subject: string;
  errorTitle: string;
  errorMessage: string;
}) => {
  try {
    await Linking.openURL(buildSupportMailTo(subject));
  } catch {
    Alert.alert(errorTitle, errorMessage);
  }
};
