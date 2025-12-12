import * as Localization from "expo-localization";
import React from "react";
import {
  StatusBar,
  Text,
  useColorScheme,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { PaperProvider } from "react-native-paper";

import ToastHost from "@common/components/ToastHost";
import i18next from "@common/i18n/i18n";
import {
  AppThemeContext,
  createAppTheme,
  type AppThemeMode,
} from "@common/theme/appTheme";
import { useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "@features/settings/store/settingsSelectors";

type Props = {
  children: React.ReactNode;
};

const getSystemLanguage = () => {
  const locales = Localization.getLocales();
  const primary = Array.isArray(locales) ? locales[0] : undefined;
  const languageCode = primary?.languageCode?.toLowerCase();
  return languageCode === "fr" ? "fr" : "en";
};

const AppPreferencesProvider: React.FC<Props> = ({ children }) => {
  const preferences = useAppSelector(settingsSelectors.preferences);
  const systemScheme = useColorScheme();
  const systemLanguage = React.useMemo(getSystemLanguage, []);

  const resolvedLanguage =
    preferences.language === "system"
      ? systemLanguage
      : preferences.language ?? systemLanguage;

  React.useEffect(() => {
    if (resolvedLanguage && i18next.language !== resolvedLanguage) {
      void i18next.changeLanguage(resolvedLanguage);
    }
  }, [resolvedLanguage]);

  const resolvedTheme: AppThemeMode =
    preferences.theme === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preferences.theme;

  const theme = React.useMemo(
    () => createAppTheme(resolvedTheme),
    [resolvedTheme]
  );

  React.useEffect(() => {
    const textWithDefaults = Text as typeof Text & {
      defaultProps?: { style?: StyleProp<TextStyle> };
    };
    textWithDefaults.defaultProps = textWithDefaults.defaultProps || {};
    const existingStyle = textWithDefaults.defaultProps.style;
    const baseStyle = Array.isArray(existingStyle)
      ? existingStyle
      : existingStyle
        ? [existingStyle]
        : [];
    textWithDefaults.defaultProps.style = [
      ...baseStyle,
      { color: theme.colors.text },
    ];
  }, [theme.colors.text]);

  return (
    <AppThemeContext.Provider value={theme}>
      <PaperProvider theme={theme.paper}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.colors.background}
        />
        {children}
        <ToastHost />
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};

export default AppPreferencesProvider;
