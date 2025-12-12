import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import activitiesEn from "@features/activities/locales/en.json";
import activitiesFr from "@features/activities/locales/fr.json";
import authEn from "@features/auth/locales/en.json";
import authFr from "@features/auth/locales/fr.json";
import importEn from "@features/import/locales/en.json";
import importFr from "@features/import/locales/fr.json";
import settingsEn from "@features/settings/locales/en.json";
import settingsFr from "@features/settings/locales/fr.json";

import commonEn from "./locales/common.en.json";
import commonFr from "./locales/common.fr.json";

const detectSystemLanguage = () => {
  const locales = Localization.getLocales();
  const primary = Array.isArray(locales) ? locales[0] : undefined;
  const languageCode = primary?.languageCode?.toLowerCase();
  return languageCode === "fr" ? "fr" : "en";
};

i18next.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      auth: authEn,
      activities: activitiesEn,
      import: importEn,
      settings: settingsEn,
    },
    fr: {
      common: commonFr,
      auth: authFr,
      activities: activitiesFr,
      import: importFr,
      settings: settingsFr,
    },
  },
  lng: detectSystemLanguage(),
  fallbackLng: "en",
  supportedLngs: ["en", "fr"],
  ns: ["common", "auth", "activities", "import", "settings"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18next;
